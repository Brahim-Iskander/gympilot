package com.gymtrack.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.gymtrack.model.CommunityMessage;

@Repository
public interface CommunityMessageRepository extends MongoRepository<CommunityMessage, String> {

    /**
     * Retrieve recent messages ordered chronologically.
     */
    List<CommunityMessage> findTop100ByOrderByCreatedAtAsc();
}
