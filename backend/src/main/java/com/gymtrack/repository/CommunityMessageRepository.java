package com.gymtrack.repository;

import java.time.Instant;
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

    /**
     * Retrieve messages created after a given timestamp, ordered chronologically.
     * Used to fetch only messages from the last 24 hours (daily chat).
     */
    List<CommunityMessage> findByCreatedAtAfterOrderByCreatedAtAsc(Instant since);

    /**
     * Delete all messages created before a given timestamp.
     * Used by the scheduled cleanup to purge messages older than 24 hours.
     */
    void deleteByCreatedAtBefore(Instant before);
}
