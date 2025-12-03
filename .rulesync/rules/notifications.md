---
description: "How to Use Notification System"
targets: ["*"]
cursor: # cursor specific rules
  alwaysApply: true
  description: "How to Use Notification System"
---
# How to use notification service on SaaS Boilerplate

## 🎯 Overview

This rule establishes comprehensive standards for implementing and managing the notification system in SaaS Boilerplate applications. It covers backend implementation using the NotificationService, frontend integration with React hooks and components, real-time delivery mechanisms, and best practices for notification management.

## 📋 Core Principles

### 1. Type-Safe Notification Implementation
- **MANDATORY**: Always use the `NotificationService` class for all notification operations
- **MANDATORY**: Leverage TypeScript inference for type safety with `NotificationEvents` and `NotificationPayloads`
- **MANDATORY**: Validate all notification data using Zod schemas defined in templates
- **MANDATORY**: Use proper context (`recipientId` or `organizationId`) for targeted delivery

### 2. Multi-Channel Delivery Strategy
- **Email Channel**: Use for important notifications requiring immediate attention
- **In-App Channel**: Use for all notifications to ensure UI consistency
- **Channel Selection**: Configure per template based on notification importance and user preferences
- **Fallback Strategy**: Always provide in-app notification as fallback for email failures

### 3. Real-Time Integration
- **Redis Integration**: Use Redis pub/sub for real-time notification delivery
- **WebSocket Support**: Implement WebSocket connections for instant UI updates
- **Event Streaming**: Leverage Igniter.js streaming capabilities for live notifications
- **Performance Optimization**: Implement efficient notification batching and throttling

## 🔧 Implementation Guidelines

### 1. Backend Notification Implementation

#### 1.1 Using the NotificationService
```typescript
import { notification } from '@/services/notification'

// ✅ CORRECT - Send notification with proper context
await notification.send({
  type: 'MEMBER_JOINED',
  data: {
    memberName: 'John Doe',
    memberEmail: 'john@example.com',
    role: 'admin'
  },
  context: {
    organizationId: 'org_123' // All organization members receive notification
  }
})

// ✅ CORRECT - Individual user notification
await notification.send({
  type: 'BILLING_FAILED',
  data: {
    amount: 99.99,
    currency: 'USD',
    reason: 'Insufficient funds',
    planName: 'Pro Plan'
  },
  context: {
    recipientId: 'user_456' // Specific user receives notification
  }
})
```

#### 1.2 Template Selection Guidelines
- **User Management**: Use `USER_INVITED`, `MEMBER_JOINED`, `MEMBER_LEFT`
- **Billing Events**: Use `BILLING_SUCCESS`, `BILLING_FAILED`, `SUBSCRIPTION_*`
- **Integration Events**: Use `INTEGRATION_CONNECTED`, `INTEGRATION_DISCONNECTED`
- **System Events**: Use `SYSTEM_MAINTENANCE` (in-app only), `GENERAL`
- **API Events**: Use `API_KEY_CREATED`, `API_KEY_EXPIRED`

#### 1.3 Context Strategy
```typescript
// ✅ CORRECT - Organization-wide notification
context: { organizationId: 'org_123' }

// ✅ CORRECT - Individual user notification
context: { recipientId: 'user_456' }

// ✅ CORRECT - Global system notification
context: { organizationId: 'org_123' } // For system-wide events

// ❌ WRONG - Missing context
context: {} // Will throw error
```

### 2. Frontend Notification Integration

#### 2.1 Using Notification Hooks
```typescript
import { useNotifications } from '@/features/notification/presentation/hooks/use-notifications'

function NotificationComponent() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading,
    error
  } = useNotifications()

  // ✅ CORRECT - Handle notification actions
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id)
    if (notification.action?.url) {
      router.push(notification.action.url)
    }
  }

  return (
    <NotificationMenu
      notifications={notifications}
      unreadCount={unreadCount}
      onNotificationClick={handleNotificationClick}
      onMarkAllAsRead={markAllAsRead}
    />
  )
}
```

#### 2.2 Notification UI Components
```typescript
// ✅ CORRECT - Notification Bell Component
<NotificationBell
  unreadCount={unreadCount}
  onClick={toggleNotificationMenu}
  className="relative"
/>

// ✅ CORRECT - Notification Menu Component
<NotificationMenu
  notifications={notifications}
  unreadCount={unreadCount}
  onNotificationClick={handleNotificationClick}
  onMarkAllAsRead={markAllAsRead}
  onClose={closeNotificationMenu}
/>
```

### 3. Real-Time Notification Delivery

#### 3.1 Redis Pub/Sub Integration
```typescript
// ✅ CORRECT - Publish notification event
await store.publish('notification:created', {
  type: 'MEMBER_JOINED',
  recipientId: 'user_123',
  data: { memberName: 'John Doe' }
})

// ✅ CORRECT - Subscribe to notification events
await store.subscribe('notification:created', (data) => {
  // Update UI with new notification
  updateNotificationState(data)
})
```

#### 3.2 WebSocket Integration
```typescript
// ✅ CORRECT - WebSocket notification delivery
const ws = new WebSocket('/api/notifications/ws')

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data)
  // Update UI with real-time notification
  addNotificationToUI(notification)
}
```

## 📋 Quality Gates

### ✅ Backend Implementation
- [ ] **Type Safety**: All notification data properly typed with Zod schemas
- [ ] **Context Validation**: Proper `recipientId` or `organizationId` provided
- [ ] **Template Usage**: Correct template selected for notification type
- [ ] **Error Handling**: Proper error handling for notification failures
- [ ] **Testing**: Unit tests for notification sending and template rendering

### ✅ Frontend Integration
- [ ] **Hook Usage**: Proper use of `useNotifications` hook
- [ ] **State Management**: Correct handling of notification state
- [ ] **UI Components**: Proper implementation of notification UI components
- [ ] **User Experience**: Smooth notification interactions and animations
- [ ] **Accessibility**: WCAG 2.1 AA compliance for notification components

### ✅ Real-Time Delivery
- [ ] **Redis Integration**: Proper pub/sub implementation
- [ ] **WebSocket Support**: Real-time notification delivery
- [ ] **Performance**: Efficient notification batching and throttling
- [ ] **Error Recovery**: Proper handling of connection failures
- [ ] **Scalability**: Support for multiple concurrent users

### ✅ Integration Testing
- [ ] **End-to-End**: Complete notification flow testing
- [ ] **Multi-Channel**: Email and in-app notification testing
- [ ] **Real-Time**: WebSocket and Redis integration testing
- [ ] **Error Scenarios**: Failure handling and recovery testing
- [ ] **Performance**: Load testing for notification delivery

## 🚀 Best Practices

### 1. Notification Design
- **Clear Messaging**: Use concise, actionable notification content
- **Contextual Actions**: Provide relevant action buttons for each notification
- **Visual Hierarchy**: Distinguish between different notification types
- **User Control**: Allow users to customize notification preferences

### 2. Performance Optimization
- **Batching**: Group multiple notifications for efficient delivery
- **Throttling**: Limit notification frequency to prevent spam
- **Caching**: Cache notification templates and user preferences
- **Lazy Loading**: Load notification history on demand

### 3. User Experience
- **Non-Intrusive**: Notifications should not disrupt user workflow
- **Dismissible**: Users should be able to dismiss notifications
- **Persistent**: Important notifications should persist until acknowledged
- **Customizable**: Users should control notification types and channels

### 4. Security Considerations
- **Authorization**: Verify user permissions before sending notifications
- **Data Privacy**: Protect sensitive information in notifications
- **Rate Limiting**: Prevent notification spam and abuse
- **Audit Trail**: Log all notification activities for compliance

## 🔗 Integration Points

### Related Rules
- `development-workflow.mdc` - Implementation standards and quality gates
- `igniter-controllers.mdc` - API endpoint implementation patterns
- `frontend.mdc` - React component and hook patterns
- `testing.mdc` - Testing strategies for notification system

### Workflow Integration
- **Feature Development**: Use notification system in feature implementations
- **User Management**: Integrate with user invitation and management flows
- **Billing Integration**: Connect with payment and subscription systems
- **System Monitoring**: Use for system alerts and maintenance notifications

### Memory System Enhancement
```typescript
// Store notification patterns for future reference
await store_memory({
  type: 'code_pattern',
  title: 'Notification System Integration Pattern',
  content: '# Notification Integration\n\n## Backend Implementation\n[Patterns]\n\n## Frontend Integration\n[Patterns]\n\n## Real-Time Delivery\n[Patterns]',
  tags: ['notifications', 'pattern', 'integration'],
  confidence: 0.9
})
```

## 📚 Template Reference

### Available Notification Templates
- **USER_INVITED**: User invitation to organization
- **MEMBER_JOINED**: New member joined organization
- **MEMBER_LEFT**: Member left organization
- **BILLING_SUCCESS**: Successful payment
- **BILLING_FAILED**: Failed payment
- **SUBSCRIPTION_CREATED**: New subscription created
- **SUBSCRIPTION_UPDATED**: Subscription updated
- **SUBSCRIPTION_CANCELED**: Subscription canceled
- **INTEGRATION_CONNECTED**: Integration connected
- **INTEGRATION_DISCONNECTED**: Integration disconnected
- **WEBHOOK_FAILED**: Webhook delivery failed
- **API_KEY_CREATED**: New API key created
- **API_KEY_EXPIRED**: API key expired
- **SYSTEM_MAINTENANCE**: System maintenance notification
- **GENERAL**: General purpose notification

### Template Usage Examples
```typescript
// User management notifications
await notification.send({
  type: 'MEMBER_JOINED',
  data: { memberName: 'Jane', memberEmail: 'jane@example.com', role: 'member' },
  context: { organizationId: 'org_123' }
})

// Billing notifications
await notification.send({
  type: 'BILLING_FAILED',
  data: { amount: 99.99, currency: 'USD', reason: 'Insufficient funds' },
  context: { recipientId: 'user_456' }
})

// System notifications
await notification.send({
  type: 'SYSTEM_MAINTENANCE',
  data: { title: 'Scheduled Maintenance', description: 'System will be down' },
  context: { organizationId: 'org_123' }
})
```

## 🔧 Troubleshooting & Common Issues

### Backend Issues
- **Context Missing**: Ensure `recipientId` or `organizationId` is provided
- **Template Not Found**: Verify template name matches available templates
- **Data Validation**: Check that data matches template schema
- **Email Delivery**: Verify email service configuration

### Frontend Issues
- **Hook Not Working**: Check if notification service is properly initialized
- **Real-Time Not Working**: Verify Redis and WebSocket connections
- **UI Not Updating**: Check state management and component re-rendering
- **Performance Issues**: Implement proper notification batching and throttling

### Integration Issues
- **Type Errors**: Ensure proper TypeScript types are imported
- **Testing Failures**: Mock notification service in tests
- **Deployment Issues**: Verify environment variables and service configurations
- **Scalability Problems**: Implement proper notification queuing and processing

## 📋 Implementation Checklist

### ✅ Backend Setup
- [ ] NotificationService properly configured
- [ ] Templates defined for all use cases
- [ ] Context validation implemented
- [ ] Error handling in place
- [ ] Unit tests written

### ✅ Frontend Integration
- [ ] Notification hooks implemented
- [ ] UI components created
- [ ] State management configured
- [ ] Real-time updates working
- [ ] User preferences implemented

### ✅ Real-Time Delivery
- [ ] Redis pub/sub configured
- [ ] WebSocket connections working
- [ ] Notification batching implemented
- [ ] Error recovery mechanisms in place
- [ ] Performance monitoring active

### ✅ Testing & Validation
- [ ] Unit tests for all components
- [ ] Integration tests for notification flow
- [ ] End-to-end tests for user experience
- [ ] Performance tests for scalability
- [ ] Security tests for authorization

This rule ensures consistent, type-safe, and efficient implementation of the notification system across all SaaS Boilerplate applications, providing both automation guidance and training context for optimal notification management.