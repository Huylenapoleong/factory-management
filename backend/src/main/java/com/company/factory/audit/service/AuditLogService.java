package com.company.factory.audit.service;

import com.company.factory.audit.domain.AuditLog;
import com.company.factory.audit.dto.AuditLogDto;
import com.company.factory.audit.repository.AuditLogRepository;
import com.company.factory.common.response.PageResponse;
import com.company.factory.user.domain.User;
import com.company.factory.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void logEvent(Long userId, String action, String entityType, String entityId, String oldValue, String newValue, String ipAddress) {
        try {
            User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;
            AuditLog auditLog = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .ipAddress(ipAddress)
                    .createdAt(Instant.now())
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to persist audit log: {}", e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogDto> getAuditLogs(Pageable pageable) {
        Page<AuditLogDto> page = auditLogRepository.findAll(pageable).map(log -> AuditLogDto.builder()
                .id(log.getId())
                .username(log.getUser() != null ? log.getUser().getUsername() : "system")
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .ipAddress(log.getIpAddress())
                .createdAt(log.getCreatedAt())
                .build());

        return PageResponse.from(page);
    }
}
