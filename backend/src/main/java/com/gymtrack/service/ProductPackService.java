package com.gymtrack.service;

import java.text.Normalizer;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.gymtrack.config.CacheConfig;
import com.gymtrack.dto.pack.ProductPackDtos.PackItemDto;
import com.gymtrack.dto.pack.ProductPackDtos.PackRequestDto;
import com.gymtrack.model.ProductPack;
import com.gymtrack.model.ProductPack.PackItem;
import com.gymtrack.model.User;
import com.gymtrack.repository.ProductPackRepository;
import com.gymtrack.repository.UserRepository;

@Service
public class ProductPackService {

    private static final Logger log = LoggerFactory.getLogger(ProductPackService.class);
    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    private final ProductPackRepository productPackRepository;
    private final UserRepository userRepository;

    public ProductPackService(ProductPackRepository productPackRepository, UserRepository userRepository) {
        this.productPackRepository = productPackRepository;
        this.userRepository = userRepository;
    }

    public List<ProductPack> getAllPacks(boolean activeOnly) {
        if (activeOnly) {
            Instant now = Instant.now();
            return productPackRepository.findByActiveTrueOrderByCreatedAtDesc().stream()
                    .filter(p -> p.getValidUntil() == null || p.getValidUntil().isAfter(now))
                    .toList();
        }
        return productPackRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<ProductPack> getActivePacks() {
        Instant now = Instant.now();
        return getAllActivePacksCached().stream()
                .filter(p -> p.getValidUntil() == null || p.getValidUntil().isAfter(now))
                .toList();
    }

    @Cacheable(value = CacheConfig.CACHE_ACTIVE_PACKS)
    public List<ProductPack> getAllActivePacksCached() {
        return productPackRepository.findByActiveTrueOrderByCreatedAtDesc();
    }

    public List<ProductPack> getFeaturedPacks() {
        Instant now = Instant.now();
        return productPackRepository.findByFeaturedTrueAndActiveTrueOrderByCreatedAtDesc().stream()
                .filter(p -> p.getValidUntil() == null || p.getValidUntil().isAfter(now))
                .toList();
    }

    public Optional<ProductPack> getPackById(String id) {
        return productPackRepository.findById(id);
    }

    public Optional<ProductPack> getPackBySlug(String slug) {
        return productPackRepository.findBySlug(slug);
    }

    public List<ProductPack> getSellerPacks(String userEmail) {
        User seller = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Seller not found: " + userEmail));
        return productPackRepository.findBySellerIdOrderByCreatedAtDesc(seller.getId());
    }

    @CacheEvict(value = CacheConfig.CACHE_ACTIVE_PACKS, allEntries = true)
    public ProductPack createPackForSeller(PackRequestDto dto, String userEmail) {
        User seller = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Seller not found: " + userEmail));

        if (!seller.isSeller() && !seller.isAdmin()) {
            throw new IllegalArgumentException("User does not hold the Seller capability.");
        }

        String slug = generateSlug(dto.name());
        int counter = 1;
        while (productPackRepository.existsBySlug(slug)) {
            slug = generateSlug(dto.name()) + "-" + counter++;
        }

        List<PackItem> items = mapItems(dto.items());

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

        ProductPack pack = new ProductPack(
                dto.name().trim(),
                slug,
                dto.tagline() != null ? dto.tagline().trim() : "",
                dto.badge() != null ? dto.badge().trim() : "",
                dto.description() != null ? dto.description().trim() : "",
                dto.originalPrice(),
                dto.price(),
                dto.images() != null ? dto.images() : List.of(),
                items,
                dto.active(),
                seller.isAdmin() && dto.featured(),
                dto.stockQuantity() > 0 ? dto.stockQuantity() : 50
        );

        pack.setSellerId(seller.getId());
        pack.setSellerName(sellerDisplayName);
        pack.setSellerStoreName(sellerStore);
        pack.setSellerStoreLogo(sellerLogo);

        applyDurationSettings(pack, dto);

        ProductPack saved = productPackRepository.save(pack);
        log.info("Seller {} created product pack offer: {} (id: {})", seller.getEmail(), saved.getName(), saved.getId());
        return saved;
    }

    @CacheEvict(value = CacheConfig.CACHE_ACTIVE_PACKS, allEntries = true)
    public ProductPack createPack(PackRequestDto dto) {
        String slug = generateSlug(dto.name());
        int counter = 1;
        while (productPackRepository.existsBySlug(slug)) {
            slug = generateSlug(dto.name()) + "-" + counter++;
        }

        List<PackItem> items = mapItems(dto.items());

        ProductPack pack = new ProductPack(
                dto.name().trim(),
                slug,
                dto.tagline() != null ? dto.tagline().trim() : "",
                dto.badge() != null ? dto.badge().trim() : "",
                dto.description() != null ? dto.description().trim() : "",
                dto.originalPrice(),
                dto.price(),
                dto.images() != null ? dto.images() : List.of(),
                items,
                dto.active(),
                dto.featured(),
                dto.stockQuantity() > 0 ? dto.stockQuantity() : 50
        );

        applyDurationSettings(pack, dto);

        ProductPack saved = productPackRepository.save(pack);
        log.info("Admin created new product pack offer: {} (id: {})", saved.getName(), saved.getId());
        return saved;
    }

    @CacheEvict(value = CacheConfig.CACHE_ACTIVE_PACKS, allEntries = true)
    public ProductPack updatePack(String id, PackRequestDto dto) {
        return updatePackForSeller(id, dto, null, true);
    }

    @CacheEvict(value = CacheConfig.CACHE_ACTIVE_PACKS, allEntries = true)
    public ProductPack updatePackForSeller(String id, PackRequestDto dto, String userEmail, boolean isAdmin) {
        ProductPack pack = productPackRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product pack not found with ID: " + id));

        if (!isAdmin && userEmail != null) {
            User seller = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Seller not found: " + userEmail));
            if (pack.getSellerId() != null && !pack.getSellerId().equals(seller.getId())) {
                throw new IllegalArgumentException("You are not authorized to update this pack.");
            }
        }

        pack.setName(dto.name().trim());
        pack.setTagline(dto.tagline() != null ? dto.tagline().trim() : "");
        pack.setBadge(dto.badge() != null ? dto.badge().trim() : "");
        pack.setDescription(dto.description() != null ? dto.description().trim() : "");
        pack.setOriginalPrice(dto.originalPrice());
        pack.setPrice(dto.price());
        pack.setImages(dto.images() != null ? dto.images() : List.of());
        pack.setItems(mapItems(dto.items()));
        pack.setActive(dto.active());
        if (isAdmin) {
            pack.setFeatured(dto.featured());
        }
        pack.setStockQuantity(dto.stockQuantity() > 0 ? dto.stockQuantity() : 0);
        applyDurationSettingsOnUpdate(pack, dto);
        pack.setUpdatedAt(Instant.now());

        ProductPack updated = productPackRepository.save(pack);
        log.info("Updated product pack: {} (id: {})", updated.getName(), updated.getId());
        return updated;
    }

    @CacheEvict(value = CacheConfig.CACHE_ACTIVE_PACKS, allEntries = true)
    public void deletePack(String id) {
        deletePackForSeller(id, null, true);
    }

    @CacheEvict(value = CacheConfig.CACHE_ACTIVE_PACKS, allEntries = true)
    public void deletePackForSeller(String id, String userEmail, boolean isAdmin) {
        ProductPack pack = productPackRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product pack not found with ID: " + id));

        if (!isAdmin && userEmail != null) {
            User seller = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Seller not found: " + userEmail));
            if (pack.getSellerId() != null && !pack.getSellerId().equals(seller.getId())) {
                throw new IllegalArgumentException("You are not authorized to delete this pack.");
            }
        }

        productPackRepository.deleteById(id);
        log.info("Deleted product pack with ID: {}", id);
    }

    @CacheEvict(value = CacheConfig.CACHE_ACTIVE_PACKS, allEntries = true)
    public ProductPack toggleActive(String id) {
        return toggleActiveForSeller(id, null, true);
    }

    @CacheEvict(value = CacheConfig.CACHE_ACTIVE_PACKS, allEntries = true)
    public ProductPack toggleActiveForSeller(String id, String userEmail, boolean isAdmin) {
        ProductPack pack = productPackRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product pack not found with ID: " + id));

        if (!isAdmin && userEmail != null) {
            User seller = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Seller not found: " + userEmail));
            if (pack.getSellerId() != null && !pack.getSellerId().equals(seller.getId())) {
                throw new IllegalArgumentException("You are not authorized to modify this pack.");
            }
        }

        pack.setActive(!pack.isActive());
        pack.setUpdatedAt(Instant.now());
        return productPackRepository.save(pack);
    }

    @CacheEvict(value = CacheConfig.CACHE_ACTIVE_PACKS, allEntries = true)
    public ProductPack toggleFeatured(String id) {
        ProductPack pack = productPackRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product pack not found with ID: " + id));
        pack.setFeatured(!pack.isFeatured());
        pack.setUpdatedAt(Instant.now());
        return productPackRepository.save(pack);
    }

    private List<PackItem> mapItems(List<PackItemDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return new ArrayList<>();
        }
        return dtos.stream()
                .filter(d -> d.name() != null && !d.name().isBlank())
                .map(d -> new PackItem(
                        d.name().trim(),
                        d.quantity() > 0 ? d.quantity() : 1,
                        d.description() != null ? d.description().trim() : "",
                        d.dosage() != null ? d.dosage().trim() : ""
                ))
                .toList();
    }

    private String generateSlug(String input) {
        if (input == null) return "pack";
        String nowhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH).replaceAll("-+", "-");
    }

    private void applyDurationSettings(ProductPack pack, PackRequestDto dto) {
        String unit = dto.durationUnit() != null ? dto.durationUnit().trim().toUpperCase() : "LIFETIME";
        Integer val = dto.durationValue();

        if ("LIFETIME".equalsIgnoreCase(unit) || "NONE".equalsIgnoreCase(unit) || "UNLIMITED".equalsIgnoreCase(unit)) {
            pack.setDurationUnit("LIFETIME");
            pack.setDurationValue(null);
            pack.setValidUntil(null);
        } else if (val != null && val > 0) {
            pack.setDurationUnit(unit);
            pack.setDurationValue(val);
            Instant now = Instant.now();
            if ("HOURS".equalsIgnoreCase(unit) || "HOUR".equalsIgnoreCase(unit)) {
                pack.setValidUntil(now.plus(val, ChronoUnit.HOURS));
            } else if ("DAYS".equalsIgnoreCase(unit) || "DAY".equalsIgnoreCase(unit)) {
                pack.setValidUntil(now.plus(val, ChronoUnit.DAYS));
            } else if ("WEEKS".equalsIgnoreCase(unit) || "WEEK".equalsIgnoreCase(unit)) {
                pack.setValidUntil(now.plus((long) val * 7, ChronoUnit.DAYS));
            } else if (dto.validUntil() != null) {
                pack.setValidUntil(dto.validUntil());
            }
        } else if (dto.validUntil() != null) {
            pack.setDurationUnit(unit != null && !unit.isBlank() ? unit : "DAYS");
            pack.setDurationValue(val);
            pack.setValidUntil(dto.validUntil());
        } else {
            pack.setDurationUnit("LIFETIME");
            pack.setDurationValue(null);
            pack.setValidUntil(null);
        }
    }

    private void applyDurationSettingsOnUpdate(ProductPack pack, PackRequestDto dto) {
        String unit = dto.durationUnit() != null ? dto.durationUnit().trim().toUpperCase() : "LIFETIME";
        Integer val = dto.durationValue();

        if ("LIFETIME".equalsIgnoreCase(unit) || "NONE".equalsIgnoreCase(unit) || "UNLIMITED".equalsIgnoreCase(unit)) {
            pack.setDurationUnit("LIFETIME");
            pack.setDurationValue(null);
            pack.setValidUntil(null);
            return;
        }

        boolean unitChanged = !unit.equalsIgnoreCase(pack.getDurationUnit());
        boolean valueChanged = (val != null && !val.equals(pack.getDurationValue())) || (val == null && pack.getDurationValue() != null);
        boolean isCurrentlyExpired = pack.isExpired();

        pack.setDurationUnit(unit);
        pack.setDurationValue(val);

        if (unitChanged || valueChanged || isCurrentlyExpired) {
            Instant now = Instant.now();
            if (val != null && val > 0) {
                if ("HOURS".equalsIgnoreCase(unit) || "HOUR".equalsIgnoreCase(unit)) {
                    pack.setValidUntil(now.plus(val, ChronoUnit.HOURS));
                } else if ("DAYS".equalsIgnoreCase(unit) || "DAY".equalsIgnoreCase(unit)) {
                    pack.setValidUntil(now.plus(val, ChronoUnit.DAYS));
                } else if ("WEEKS".equalsIgnoreCase(unit) || "WEEK".equalsIgnoreCase(unit)) {
                    pack.setValidUntil(now.plus((long) val * 7, ChronoUnit.DAYS));
                } else if (dto.validUntil() != null) {
                    pack.setValidUntil(dto.validUntil());
                }
            } else if (dto.validUntil() != null) {
                pack.setValidUntil(dto.validUntil());
            }
        } else if (dto.validUntil() != null) {
            pack.setValidUntil(dto.validUntil());
        }
    }
}
