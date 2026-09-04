package com.gymtrack.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.gymtrack.dto.CreateProductRequest;
import com.gymtrack.dto.PagedResponse;
import com.gymtrack.dto.ProductResponse;
import com.gymtrack.dto.UpdateProductRequest;
import com.gymtrack.exception.InvalidCredentialsException;
import com.gymtrack.model.Category;
import com.gymtrack.model.Product;
import com.gymtrack.model.User;
import com.gymtrack.repository.CategoryRepository;
import com.gymtrack.repository.ProductRepository;
import com.gymtrack.repository.UserRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          UserRepository userRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public PagedResponse<ProductResponse> getActiveProducts(String categoryId, String search, String sortStr, int page, int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("price_asc".equalsIgnoreCase(sortStr)) {
            sort = Sort.by(Sort.Direction.ASC, "price");
        } else if ("price_desc".equalsIgnoreCase(sortStr)) {
            sort = Sort.by(Sort.Direction.DESC, "price");
        } else if ("popularity".equalsIgnoreCase(sortStr) || "best_selling".equalsIgnoreCase(sortStr)) {
            sort = Sort.by(Sort.Direction.DESC, "unitsSold");
        } else if ("rating".equalsIgnoreCase(sortStr)) {
            sort = Sort.by(Sort.Direction.DESC, "rating");
        }

        PageRequest pageRequest = PageRequest.of(page, size, sort);
        Page<Product> productPage;

        boolean hasCategory = categoryId != null && !categoryId.isBlank() && !"all".equalsIgnoreCase(categoryId);
        boolean hasSearch = search != null && !search.trim().isEmpty();

        if (hasCategory && hasSearch) {
            productPage = productRepository.searchActiveProductsInCategory(search.trim(), categoryId, pageRequest);
        } else if (hasCategory) {
            productPage = productRepository.findByCategoryIdAndActiveTrue(categoryId, pageRequest);
        } else if (hasSearch) {
            productPage = productRepository.searchActiveProducts(search.trim(), pageRequest);
        } else {
            productPage = productRepository.findByActiveTrue(pageRequest);
        }

        List<ProductResponse> content = productPage.getContent().stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                productPage.getNumber(),
                productPage.getSize(),
                productPage.getTotalElements(),
                productPage.getTotalPages()
        );
    }

    public ProductResponse getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new InvalidCredentialsException("Product not found: " + id));

        // Increment view count
        product.setViews(product.getViews() + 1);
        productRepository.save(product);

        return mapToProductResponse(product);
    }

    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findTop6ByActiveTrueAndFeaturedTrueOrderByCreatedAtDesc().stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getBestSellers() {
        return productRepository.findTop6ByActiveTrueOrderByUnitsSoldDesc().stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getRelatedProducts(String productId, int limit) {
        Product current = productRepository.findById(productId).orElse(null);
        if (current == null || current.getCategoryId() == null) {
            return new ArrayList<>();
        }
        PageRequest pr = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "unitsSold"));
        return productRepository.findByCategoryIdAndActiveTrueAndIdNot(current.getCategoryId(), productId, pr).stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse createProduct(CreateProductRequest request, String userEmail) {
        User seller = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new InvalidCredentialsException("Seller not found: " + userEmail));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new InvalidCredentialsException("Category not found: " + request.categoryId()));

        String slug = generateSlug(request.name());

        String sellerDisplayName = (seller.getFirstName() != null ? seller.getFirstName() : "") +
                (seller.getLastName() != null ? " " + seller.getLastName() : "");
        sellerDisplayName = sellerDisplayName.trim();
        if (sellerDisplayName.isEmpty()) {
            sellerDisplayName = seller.getEmail();
        }

        String sellerStore = (seller.getStoreName() != null && !seller.getStoreName().isBlank())
                ? seller.getStoreName()
                : sellerDisplayName + " Store";

        String sellerLogo = seller.getStoreLogo() != null && !seller.getStoreLogo().isBlank()
                ? seller.getStoreLogo()
                : seller.getAvatar();

        Product product = new Product(
                request.name(),
                slug,
                request.description(),
                category.getId(),
                category.getName(),
                request.price(),
                request.originalPrice(),
                request.stockQuantity(),
                request.images(),
                request.specs(),
                seller.getId(),
                sellerDisplayName,
                sellerStore,
                sellerLogo
        );

        if (request.active() != null) {
            product.setActive(request.active());
        }
        if (request.featured() != null) {
            product.setFeatured(request.featured());
        }

        Product saved = productRepository.save(product);
        return mapToProductResponse(saved);
    }

    public ProductResponse updateProduct(String productId, UpdateProductRequest request, String userEmail, boolean isAdmin) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new InvalidCredentialsException("Product not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        if (!isAdmin && !product.getSellerId().equals(user.getId())) {
            throw new IllegalArgumentException("You are not authorized to edit products belonging to other sellers.");
        }

        if (request.name() != null && !request.name().isBlank()) {
            product.setName(request.name());
            product.setSlug(generateSlug(request.name()));
        }
        if (request.description() != null) {
            product.setDescription(request.description());
        }
        if (request.categoryId() != null && !request.categoryId().isBlank()) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new InvalidCredentialsException("Category not found: " + request.categoryId()));
            product.setCategoryId(category.getId());
            product.setCategoryName(category.getName());
        }
        if (request.price() != null) {
            product.setPrice(request.price());
        }
        if (request.originalPrice() != null) {
            product.setOriginalPrice(request.originalPrice());
        }
        if (request.stockQuantity() != null) {
            product.setStockQuantity(request.stockQuantity());
        }
        if (request.images() != null) {
            product.setImages(request.images());
        }
        if (request.specs() != null) {
            product.setSpecs(request.specs());
        }
        if (request.active() != null) {
            product.setActive(request.active());
        }
        if (request.featured() != null) {
            product.setFeatured(request.featured());
        }

        product.setUpdatedAt(Instant.now());
        Product saved = productRepository.save(product);
        return ProductResponse.from(saved);
    }

    public void deleteProduct(String productId, String userEmail, boolean isAdmin) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new InvalidCredentialsException("Product not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        if (!isAdmin && !product.getSellerId().equals(user.getId())) {
            throw new IllegalArgumentException("You are not authorized to delete products belonging to other sellers.");
        }

        productRepository.delete(product);
    }

    public ProductResponse toggleProductActive(String productId, String userEmail, boolean isAdmin) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new InvalidCredentialsException("Product not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        if (!isAdmin && !product.getSellerId().equals(user.getId())) {
            throw new IllegalArgumentException("You are not authorized to modify products belonging to other sellers.");
        }

        product.setActive(!product.isActive());
        product.setUpdatedAt(Instant.now());
        Product saved = productRepository.save(product);
        return ProductResponse.from(saved);
    }

    public PagedResponse<ProductResponse> getSellerProducts(String sellerEmail, int page, int size) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Product> productPage = productRepository.findBySellerId(seller.getId(), pageRequest);

        List<ProductResponse> content = productPage.getContent().stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                productPage.getNumber(),
                productPage.getSize(),
                productPage.getTotalElements(),
                productPage.getTotalPages()
        );
    }

    private ProductResponse mapToProductResponse(Product p) {
        if ((p.getSellerStoreLogo() == null || p.getSellerStoreLogo().isBlank()) && p.getSellerId() != null) {
            userRepository.findById(p.getSellerId()).ifPresent(u -> {
                String logo = u.getStoreLogo() != null && !u.getStoreLogo().isBlank() ? u.getStoreLogo() : u.getAvatar();
                if (logo != null && !logo.isBlank()) {
                    p.setSellerStoreLogo(logo);
                }
            });
        }
        return ProductResponse.from(p);
    }

    private String generateSlug(String name) {
        String base = name.toLowerCase().trim().replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
        return base + "-" + System.currentTimeMillis() % 100000;
    }
}
