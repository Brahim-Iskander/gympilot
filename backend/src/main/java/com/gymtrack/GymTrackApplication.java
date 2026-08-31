package com.gymtrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GymTrackApplication {

    public static void main(String[] args) {
        SpringApplication.run(GymTrackApplication.class, args);
    }
}
