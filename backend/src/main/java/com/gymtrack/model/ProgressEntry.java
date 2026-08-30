package com.gymtrack.model;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "progress_entries")
public class ProgressEntry {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private LocalDate date;

    private Double weight;
    private String weightUnit = "kg";

    // Flexible key-value measurements: e.g. "chest": 102.0, "waist": 84.0, "hips": 96.0, "arms": 38.0, "thighs": 58.0, "neck": 39.0
    private Map<String, Double> measurements = new HashMap<>();
    private String measurementUnit = "cm";

    private List<StrengthLog> strengthLogs = new ArrayList<>();

    private List<ProgressPhoto> photos = new ArrayList<>();

    private String note;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public ProgressEntry() {
    }

    public ProgressEntry(String userId, LocalDate date) {
        this.userId = userId;
        this.date = date;
    }

    public static class StrengthLog {
        private String exerciseName;
        private Double weight;
        private Integer reps;
        private Integer sets;
        private Boolean isPR = false;
        private String notes;

        public StrengthLog() {}

        public StrengthLog(String exerciseName, Double weight, Integer reps, Integer sets, Boolean isPR, String notes) {
            this.exerciseName = exerciseName;
            this.weight = weight;
            this.reps = reps;
            this.sets = sets;
            this.isPR = isPR;
            this.notes = notes;
        }

        public String getExerciseName() { return exerciseName; }
        public void setExerciseName(String exerciseName) { this.exerciseName = exerciseName; }
        public Double getWeight() { return weight; }
        public void setWeight(Double weight) { this.weight = weight; }
        public Integer getReps() { return reps; }
        public void setReps(Integer reps) { this.reps = reps; }
        public Integer getSets() { return sets; }
        public void setSets(Integer sets) { this.sets = sets; }
        public Boolean getIsPR() { return isPR; }
        public void setIsPR(Boolean isPR) { this.isPR = isPR; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class ProgressPhoto {
        private String id;
        private String angle; // "front", "side", "back", "other"
        private String url;   // base64 data url or image uri
        private String caption;
        private Instant uploadedAt;

        public ProgressPhoto() {}

        public ProgressPhoto(String id, String angle, String url, String caption, Instant uploadedAt) {
            this.id = id;
            this.angle = angle;
            this.url = url;
            this.caption = caption;
            this.uploadedAt = uploadedAt != null ? uploadedAt : Instant.now();
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getAngle() { return angle; }
        public void setAngle(String angle) { this.angle = angle; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public String getCaption() { return caption; }
        public void setCaption(String caption) { this.caption = caption; }
        public Instant getUploadedAt() { return uploadedAt; }
        public void setUploadedAt(Instant uploadedAt) { this.uploadedAt = uploadedAt; }
    }

    // Getters and Setters

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
    public String getWeightUnit() { return weightUnit; }
    public void setWeightUnit(String weightUnit) { this.weightUnit = weightUnit; }
    public Map<String, Double> getMeasurements() { return measurements; }
    public void setMeasurements(Map<String, Double> measurements) { this.measurements = measurements; }
    public String getMeasurementUnit() { return measurementUnit; }
    public void setMeasurementUnit(String measurementUnit) { this.measurementUnit = measurementUnit; }
    public List<StrengthLog> getStrengthLogs() { return strengthLogs; }
    public void setStrengthLogs(List<StrengthLog> strengthLogs) { this.strengthLogs = strengthLogs; }
    public List<ProgressPhoto> getPhotos() { return photos; }
    public void setPhotos(List<ProgressPhoto> photos) { this.photos = photos; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
