package com.gymtrack.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.gymtrack.model.CoachMessage;

public interface CoachMessageRepository extends MongoRepository<CoachMessage, String> {

    List<CoachMessage> findByUserIdOrderByCreatedAtAsc(String userId);

    List<CoachMessage> findByUserIdAndSenderRoleAndIsReadByUserFalse(String userId, String senderRole);

    List<CoachMessage> findByUserIdAndSenderRoleAndIsReadByCoachFalse(String userId, String senderRole);

    long countByUserIdAndSenderRoleAndIsReadByUserFalse(String userId, String senderRole);

    long countBySenderRoleAndIsReadByCoachFalse(String senderRole);
}
