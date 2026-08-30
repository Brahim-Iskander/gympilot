package com.gymtrack.model;

import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_onboardings")
public class UserOnboarding {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String goal;
    private String experienceLevel;
    private Integer trainingMonths;
    private Integer daysPerWeek;
    private List<String> preferredDays;
    private Integer minutesPerSession;
    private String equipment;
    private String currentRoutine;
    private String strengthLevels;
    private List<String> likedExercises;
    private List<String> dislikedExercises;
    private String injuries;
    private List<String> cannotDoExercises;
    
    private String aiGeneratedPlan;

    private Integer age;
    private String sex;
    private Double heightCm;
    private Double weightKg;

    private Boolean completed;
    private Integer currentStep;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public UserOnboarding() {}

    public UserOnboarding(String userId) {
        this.userId = userId;
        this.completed = false;
        this.currentStep = 1;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }
    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }
    public Integer getTrainingMonths() { return trainingMonths; }
    public void setTrainingMonths(Integer trainingMonths) { this.trainingMonths = trainingMonths; }
    public Integer getDaysPerWeek() { return daysPerWeek; }
    public void setDaysPerWeek(Integer daysPerWeek) { this.daysPerWeek = daysPerWeek; }
    public List<String> getPreferredDays() { return preferredDays; }
    public void setPreferredDays(List<String> preferredDays) { this.preferredDays = preferredDays; }
    public Integer getMinutesPerSession() { return minutesPerSession; }
    public void setMinutesPerSession(Integer minutesPerSession) { this.minutesPerSession = minutesPerSession; }
    public String getEquipment() { return equipment; }
    public void setEquipment(String equipment) { this.equipment = equipment; }
    public String getCurrentRoutine() { return currentRoutine; }
    public void setCurrentRoutine(String currentRoutine) { this.currentRoutine = currentRoutine; }
    public String getStrengthLevels() { return strengthLevels; }
    public void setStrengthLevels(String strengthLevels) { this.strengthLevels = strengthLevels; }
    public List<String> getLikedExercises() { return likedExercises; }
    public void setLikedExercises(List<String> likedExercises) { this.likedExercises = likedExercises; }
    public List<String> getDislikedExercises() { return dislikedExercises; }
    public void setDislikedExercises(List<String> dislikedExercises) { this.dislikedExercises = dislikedExercises; }
    public String getInjuries() { return injuries; }
    public void setInjuries(String injuries) { this.injuries = injuries; }
    public List<String> getCannotDoExercises() { return cannotDoExercises; }
    public void setCannotDoExercises(List<String> cannotDoExercises) { this.cannotDoExercises = cannotDoExercises; }
    public String getAiGeneratedPlan() { return aiGeneratedPlan; }
    public void setAiGeneratedPlan(String aiGeneratedPlan) { this.aiGeneratedPlan = aiGeneratedPlan; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }
    public Double getHeightCm() { return heightCm; }
    public void setHeightCm(Double heightCm) { this.heightCm = heightCm; }
    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }
    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }
    public Integer getCurrentStep() { return currentStep; }
    public void setCurrentStep(Integer currentStep) { this.currentStep = currentStep; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}