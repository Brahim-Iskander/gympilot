package com.gymtrack.dto.nutrition;

import java.util.List;

public class MealPlannerDtos {

    public record MealPlannerRequest(
            Double customDailyBudgetTnd,
            String budgetTier, // "BUDGET", "BALANCED", "PERFORMANCE"
            Integer mealCount, // 3, 4, or 5 meals
            String preferredProteins, // e.g. "escalope, thon, oeufs"
            String dietaryPreferences // e.g. "sans lactose", "pas de poisson"
    ) {}

    public record PlannedMealDto(
            String id,
            String type, // "Breakfast", "Lunch", "Dinner", "Snack"
            String name,
            Integer calories,
            Integer protein,
            Integer carbs,
            Integer fat,
            Double estimatedCostTnd,
            String ingredients,
            String recipeTips,
            String budgetSwaps
    ) {}

    public record GroceryItemDto(
            String category, // "Boucherie & Volailles", "Épicerie & Céréales", "Fruits & Légumes", "Produits Laitiers & Œufs"
            String name,
            String quantity,
            Double estimatedCostTnd
    ) {}

    public record MealPlannerResponse(
            Double targetCalories,
            Integer targetProteinGrams,
            Integer targetCarbsGrams,
            Integer targetFatGrams,
            Double targetDailyBudgetTnd,
            Double totalDailyCostTnd,
            Double totalWeeklyBudgetTnd,
            String goalSummary,
            String profileSummary,
            List<PlannedMealDto> meals,
            List<GroceryItemDto> weeklyGroceryList,
            List<String> tunisianMarketHacks
    ) {}
}
