package com.gymtrack.nutrition;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.gymtrack.dto.nutrition.MealPlannerDtos.GroceryItemDto;
import com.gymtrack.dto.nutrition.MealPlannerDtos.MealPlannerResponse;
import com.gymtrack.dto.nutrition.MealPlannerDtos.PlannedMealDto;
import com.gymtrack.model.UserOnboarding;

/**
 * Domain catalog of authentic Tunisian market foods, macro densities, and localized 2026 pricing (TND / DT).
 * Used for both smart deterministic meal planning and fallback generation.
 */
public class TunisianFoodCatalog {

    public static MealPlannerResponse generateTailoredPlan(
            UserOnboarding o,
            Double requestedBudget,
            String budgetTier,
            Integer mealCount
    ) {
        double weight = (o != null && o.getWeightKg() != null) ? o.getWeightKg() : 75.0;
        double height = (o != null && o.getHeightCm() != null) ? o.getHeightCm() : 175.0;
        int age = (o != null && o.getAge() != null) ? o.getAge() : 24;
        String sex = (o != null && o.getSex() != null) ? o.getSex().toLowerCase() : "male";
        String rawGoal = (o != null && o.getGoal() != null) ? o.getGoal().toLowerCase() : "muscle";

        // Calculate BMR using Mifflin-St Jeor equation
        double bmr;
        if (sex.contains("fem") || sex.contains("wom")) {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        }

        // TDEE multiplier based on training frequency
        int days = (o != null && o.getDaysPerWeek() != null) ? o.getDaysPerWeek() : 4;
        double activityMultiplier = 1.35;
        if (days >= 5) activityMultiplier = 1.55;
        else if (days >= 3) activityMultiplier = 1.45;

        double tdee = bmr * activityMultiplier;

        // Goal adjustments
        double targetCalories;
        String goalLabel;
        if (rawGoal.contains("lose") || rawGoal.contains("fat") || rawGoal.contains("cut") || rawGoal.contains("poids") || rawGoal.contains("sèche")) {
            targetCalories = Math.round(tdee - 450);
            goalLabel = "Sèche / Perte de Gras Contrôlée (Déficit modéré)";
        } else if (rawGoal.contains("gain") || rawGoal.contains("muscle") || rawGoal.contains("bulk") || rawGoal.contains("masse")) {
            targetCalories = Math.round(tdee + 350);
            goalLabel = "Prise de Masse Musculaire Propre (Surplus calibré)";
        } else if (rawGoal.contains("strength") || rawGoal.contains("force")) {
            targetCalories = Math.round(tdee + 200);
            goalLabel = "Développement de la Force & Performance";
        } else {
            targetCalories = Math.round(tdee);
            goalLabel = "Recomposition Corporelle & Maintien Actif";
        }

        targetCalories = Math.max(1600, Math.min(3800, targetCalories));

        // Macros tailored to fitness goals (1.8g - 2.2g protein per kg)
        int targetProtein = (int) Math.round(weight * 2.0);
        int targetFat = (int) Math.round((targetCalories * 0.25) / 9.0);
        int targetCarbs = (int) Math.round((targetCalories - (targetProtein * 4 + targetFat * 9)) / 4.0);

        // Budget tier normalization
        double dailyBudget = (requestedBudget != null && requestedBudget > 5.0) ? requestedBudget : 20.0;
        if (budgetTier != null) {
            if (budgetTier.equalsIgnoreCase("BUDGET")) dailyBudget = 13.5;
            else if (budgetTier.equalsIgnoreCase("PERFORMANCE")) dailyBudget = 34.0;
            else if (budgetTier.equalsIgnoreCase("BALANCED")) dailyBudget = 21.0;
        }

        int count = (mealCount != null && (mealCount == 3 || mealCount == 4 || mealCount == 5)) ? mealCount : 4;

        List<PlannedMealDto> meals = buildTunisianMeals(targetCalories, targetProtein, targetCarbs, targetFat, dailyBudget, count, rawGoal);

        double totalDailyCost = meals.stream().mapToDouble(PlannedMealDto::estimatedCostTnd).sum();
        totalDailyCost = Math.round(totalDailyCost * 10.0) / 10.0;
        double totalWeeklyBudget = Math.round(totalDailyCost * 7.0 * 10.0) / 10.0;

        List<GroceryItemDto> groceryList = buildTunisianGroceryList(dailyBudget, targetProtein);

        List<String> marketHacks = List.of(
                "Le plateau de 30 œufs frais au souk ou chez l'épicier (~12.500 DT) est la source de protéine la plus économique de Tunisie (0.42 DT / œuf).",
                "L'escalope de dinde reste 15% moins chère que le poulet entier et 50% moins chère que la viande bovine, avec 24g de protéine pure aux 100g.",
                "La ricotta fraîche tunisienne (Jben arbi doux, ~1.400 DT les 250g) est une alternative locale très riche en caséine et leucine à consommer le soir.",
                "Les dattes Deglet Nour du Sud sont la meilleure source de glucides pré-workout naturels et de potassium contre les crampes musculaires.",
                "Pour les collations à petit budget, les cacahuètes tunisiennes (kawkaw grillé non salé ~10 DT/kg) apportent 26% de protéines et des lipides sains."
        );

        String profileSummary = String.format("%.0f kg · %.0f cm · %s (%dj/semaine)", weight, height, goalLabel, days);

        return new MealPlannerResponse(
                targetCalories,
                targetProtein,
                targetCarbs,
                targetFat,
                dailyBudget,
                totalDailyCost,
                totalWeeklyBudget,
                goalLabel,
                profileSummary,
                meals,
                groceryList,
                marketHacks
        );
    }

    private static List<PlannedMealDto> buildTunisianMeals(
            double totalKcal,
            int totalProt,
            int totalCarbs,
            int totalFat,
            double dailyBudget,
            int mealCount,
            String goal
    ) {
        List<PlannedMealDto> meals = new ArrayList<>();
        boolean isBudget = dailyBudget < 16.0;
        boolean isHighBudget = dailyBudget >= 28.0;

        // 1. PETIT DÉJEUNER (Breakfast)
        if (isBudget) {
            meals.add(new PlannedMealDto(
                    UUID.randomUUID().toString(),
                    "Breakfast",
                    "Bol Énergie Avoine, Dattes & Œufs Durs",
                    (int) Math.round(totalKcal * 0.25),
                    (int) Math.round(totalProt * 0.24),
                    (int) Math.round(totalCarbs * 0.32),
                    (int) Math.round(totalFat * 0.22),
                    2.8,
                    "Flocons d'avoine tunisiens (70g), 200ml Lait demi-écrémé, 4 Dattes Deglet Nour, 2 Œufs durs avec une pincée de cumin",
                    "Faites chauffer le lait avec l'avoine 3 minutes, ajoutez les dattes coupées en morceaux. Servez avec les 2 œufs durs assaisonnés.",
                    "Si pas d'avoine, remplacez par 60g de Bsissa d'orge sans sucre diluée dans le lait chaud."
            ));
        } else {
            meals.add(new PlannedMealDto(
                    UUID.randomUUID().toString(),
                    "Breakfast",
                    "Omelette Tunisienne au Cumin & Pain Complet Toasté",
                    (int) Math.round(totalKcal * 0.26),
                    (int) Math.round(totalProt * 0.26),
                    (int) Math.round(totalCarbs * 0.28),
                    (int) Math.round(totalFat * 0.26),
                    isHighBudget ? 4.8 : 3.8,
                    "3 Œufs entiers de ferme, 50g Ricotta fraîche tunisienne, Persil frais haché, 1/2 oignon émincé, 2 tranches Pain complet / Khobz ch3ir (80g), 1 c.à.c Huile d'olive vierge extra",
                    "Battez les œufs avec le persil, cumin, sel et ricotta. Cuisez à la poêle avec l'huile d'olive. Servez avec le pain toasté.",
                    "Remplacez la ricotta par 1 portion de fromage frais Jben arbi."
            ));
        }

        // 2. DÉJEUNER (Lunch)
        if (isBudget) {
            meals.add(new PlannedMealDto(
                    UUID.randomUUID().toString(),
                    "Lunch",
                    "Riz Randa & Escalope de Dinde Marinée aux Épices",
                    (int) Math.round(totalKcal * 0.36),
                    (int) Math.round(totalProt * 0.38),
                    (int) Math.round(totalCarbs * 0.38),
                    (int) Math.round(totalFat * 0.28),
                    4.9,
                    "160g Escalope de dinde émincée, 150g Riz étuvé (Randa ou Spiga), Salade tunisienne (concombre, tomate, oignon, persil), 1 c.à.s Huile d'olive (Zit Zitouna), Tabel-karwia & curcuma",
                    "Faites mariner l'escalope 10 min avec curcuma, ail et tabel. Saisissez à la poêle avec un filet d'huile d'olive. Servez chaud avec le riz et la salade fraîche.",
                    "En cas de rupture d'escalope, 1 boîte de thon au naturel (El Manar 160g) + 1 œuf dur fournit un macro profil identique."
            ));
        } else if (isHighBudget) {
            meals.add(new PlannedMealDto(
                    UUID.randomUUID().toString(),
                    "Lunch",
                    "Steak de Bœuf Tunisien Saisi & Patates Douces Rôties",
                    (int) Math.round(totalKcal * 0.36),
                    (int) Math.round(totalProt * 0.40),
                    (int) Math.round(totalCarbs * 0.36),
                    (int) Math.round(totalFat * 0.30),
                    9.8,
                    "180g Rumsteak ou viande hachée maigre 5%, 220g Patates douces tunisiennes au four, Salade Méchouia maison douce, 1 c.à.s Huile d'olive vierge extra",
                    "Coupez les patates douces en frites, saupoudrez de thym et sel, enfournez 25 min à 200°C. Grillez la viande à feu vif 2-3 min par face.",
                    "Peut être alterné avec 200g de filet de loup ou daurade fraîche du marché."
            ));
        } else {
            meals.add(new PlannedMealDto(
                    UUID.randomUUID().toString(),
                    "Lunch",
                    "Escalope Grillée au Citron, Riz Basmati & Salade Mechouia",
                    (int) Math.round(totalKcal * 0.35),
                    (int) Math.round(totalProt * 0.38),
                    (int) Math.round(totalCarbs * 0.38),
                    (int) Math.round(totalFat * 0.28),
                    6.2,
                    "190g Escalope de dinde ou poulet, 180g Riz basmati cuit, 80g Salade Mechouia tunisienne, 1 c.à.s Huile d'olive vierge, Jus de citron frais",
                    "Grillez l'escalope assaisonnée de tabel et jus de citron. Accompagnez de riz basmati vapeur et de méchouia arrosée d'huile d'olive.",
                    "Possibilité de troquer le riz contre 160g de pâtes complètes Spiga."
            ));
        }

        // 3. COLLATION (Snack)
        if (mealCount >= 4) {
            if (isBudget) {
                meals.add(new PlannedMealDto(
                        UUID.randomUUID().toString(),
                        "Snack",
                        "Collation Tunisienne Kawkaw, Banane & Ricotta",
                        (int) Math.round(totalKcal * 0.15),
                        (int) Math.round(totalProt * 0.14),
                        (int) Math.round(totalCarbs * 0.16),
                        (int) Math.round(totalFat * 0.22),
                        1.8,
                        "80g Ricotta fraîche locale (Vitalait / Délice), 1 Banane mûre, 25g Cacahuètes grillées non salées (kawkaw du souk)",
                        "Mélangez la ricotta avec la banane coupée en rondelles et parsemez de cacahuètes concassées. Idéal 1h avant l'entraînement.",
                        "Remplacez les cacahuètes par 3 dattes Deglet Nour farcies à la ricotta."
                ));
            } else {
                meals.add(new PlannedMealDto(
                        UUID.randomUUID().toString(),
                        "Snack",
                        "Power Shake Dattes Deglet Nour & Amandes Tunisiennes",
                        (int) Math.round(totalKcal * 0.16),
                        (int) Math.round(totalProt * 0.16),
                        (int) Math.round(totalCarbs * 0.18),
                        (int) Math.round(totalFat * 0.24),
                        isHighBudget ? 3.5 : 2.6,
                        "250ml Lait demi-écrémé ou végétal, 4 Dattes Deglet Nour dénoyautées, 1 Banane, 20g Amandes tunisiennes, 1 dose Protéine Whey (ou 100g fromage blanc)",
                        "Mixez l'ensemble au blender pendant 45 secondes jusqu'à texture onctueuse et mousseuse. Consommez immédiatement.",
                        "Si vous n'avez pas de blender, consommez les dattes et amandes entières avec un verre de lait."
                ));
            }
        }

        // 4. DÎNER (Dinner)
        if (isBudget) {
            meals.add(new PlannedMealDto(
                    UUID.randomUUID().toString(),
                    "Dinner",
                    "Lablabi Fitness Protéiné au Thon & Œuf Poché",
                    (int) Math.round(totalKcal * 0.24),
                    (int) Math.round(totalProt * 0.24),
                    (int) Math.round(totalCarbs * 0.24),
                    (int) Math.round(totalFat * 0.28),
                    3.8,
                    "180g Pois chiches cuits avec leur bouillon au cumin et ail, 1 Boîte de thon au naturel (80g égoutté), 2 Œufs mollets / pochés, 1 c.à.c Huile d'olive, Jus de citron, Cumin",
                    "Réchauffez les pois chiches dans leur bouillon épicé au cumin. Déposez les 2 œufs pochés et le thon émietté sur le dessus avec un filet d'huile d'olive et du jus de citron.",
                    "Alternative économique du soir: Chakchouka rapide aux tomates, oignons et 3 œufs battus."
            ));
        } else {
            meals.add(new PlannedMealDto(
                    UUID.randomUUID().toString(),
                    "Dinner",
                    "Chakchouka Verte Gourmande, Escalope de Dinde & Œufs",
                    (int) Math.round(totalKcal * 0.24),
                    (int) Math.round(totalProt * 0.24),
                    (int) Math.round(totalCarbs * 0.22),
                    (int) Math.round(totalFat * 0.24),
                    isHighBudget ? 7.2 : 5.2,
                    "150g Escalope de dinde coupée en dés, 2 Poivrons doux (vert et rouge), 2 Tomates mûres concassées, Ail haché, 2 Œufs de ferme, 1 tranche Pain complet (50g), 1 c.à.s Huile d'olive",
                    "Faites revenir l'ail et les poivrons dans l'huile d'olive, ajoutez les tomates et la dinde. Une fois mijoté, cassez les 2 œufs directement dans la sauce et couvrez 3 min.",
                    "Vous pouvez substituer l'escalope par 150g de crevettes du marché ou sardines fraîches grillées."
            ));
        }

        // 5. 5th MEAL (Collation du Soir / Post-Dinner if 5 meals requested)
        if (mealCount == 5) {
            meals.add(new PlannedMealDto(
                    UUID.randomUUID().toString(),
                    "Snack",
                    "Bol Caséine Tunisien Anti-Catabolique",
                    (int) Math.round(totalKcal * 0.10),
                    (int) Math.round(totalProt * 0.12),
                    (int) Math.round(totalCarbs * 0.08),
                    (int) Math.round(totalFat * 0.10),
                    1.6,
                    "120g Ricotta fraîche tunisienne, 1 c.à.c Miel pur ou cannelle, 15g Graines de lin ou kawkaw",
                    "Mélangez la ricotta avec la cannelle ou une goutte de miel. À consommer 30 minutes avant le sommeil pour nourrir le muscle toute la nuit.",
                    "Peut être remplacé par 1 pot de fromage blanc 0% et une tisane verveine/camomille."
            ));
        }

        return meals;
    }

    private static List<GroceryItemDto> buildTunisianGroceryList(double dailyBudget, int targetProtein) {
        List<GroceryItemDto> list = new ArrayList<>();
        boolean isBudget = dailyBudget < 16.0;

        // Boucherie & Poissonnerie
        if (isBudget) {
            list.add(new GroceryItemDto("Boucherie & Poissonnerie", "Escalope de Dinde fraîche (Boucherie/Chahia/Mliha)", "1.2 kg", 21.6));
            list.add(new GroceryItemDto("Boucherie & Poissonnerie", "Boîtes de Thon au naturel (El Manar / Sidi Daoud)", "4 boîtes (160g)", 14.8));
            list.add(new GroceryItemDto("Boucherie & Poissonnerie", "Sardines fraîches du marché", "500g", 3.5));
        } else {
            list.add(new GroceryItemDto("Boucherie & Poissonnerie", "Escalope de Dinde / Poulet fermier", "1.5 kg", 27.5));
            list.add(new GroceryItemDto("Boucherie & Poissonnerie", "Viande hachée pur bœuf 5% ou Foie de veau", "500g", 18.5));
            list.add(new GroceryItemDto("Boucherie & Poissonnerie", "Boîtes de Thon à l'huile d'olive (El Manar)", "3 boîtes", 12.6));
        }

        // Produits Laitiers & Œufs
        list.add(new GroceryItemDto("Produits Laitiers & Œufs", "Plateau de 30 Œufs frais de ferme", "1 plateau (30 pièces)", 12.5));
        list.add(new GroceryItemDto("Produits Laitiers & Œufs", "Ricotta fraîche locale (Vitalait / Délice)", "3 pots (250g)", 4.2));
        list.add(new GroceryItemDto("Produits Laitiers & Œufs", "Lait demi-écrémé tunisien", "3 litres", 4.35));

        // Épicerie & Céréales
        list.add(new GroceryItemDto("Épicerie & Céréales", "Riz étuvé / Basmati (Randa ou Spiga)", "1 kg", 3.2));
        list.add(new GroceryItemDto("Épicerie & Céréales", "Flocons d'avoine tunisiens / importés", "500g", 3.8));
        list.add(new GroceryItemDto("Épicerie & Céréales", "Pois chiches secs (pour Lablabi sain)", "500g", 2.4));
        list.add(new GroceryItemDto("Épicerie & Céréales", "Pain complet tranché ou Khobz ch3ir", "4 unités", 2.8));
        list.add(new GroceryItemDto("Épicerie & Céréales", "Huile d'olive extra-vierge tunisienne (Zit Zitouna)", "Bouteille 750ml (au prorata)", 9.5));

        // Fruits, Légumes & Fruits Secs
        list.add(new GroceryItemDto("Fruits & Légumes", "Dattes Deglet Nour du Sud", "500g", 4.5));
        list.add(new GroceryItemDto("Fruits & Légumes", "Bananes", "1 kg", 5.8));
        list.add(new GroceryItemDto("Fruits & Légumes", "Tomates fraîches, Poivrons & Oignons", "2.5 kg", 5.5));
        list.add(new GroceryItemDto("Fruits & Légumes", "Cacahuètes grillées non salées (kawkaw du souk)", "250g", 2.6));

        return list;
    }
}
