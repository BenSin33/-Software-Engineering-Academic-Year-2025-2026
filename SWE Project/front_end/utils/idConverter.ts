/**
 * ID Converter Utility
 * 
 * Converts between string UserIDs (U001, U002, etc.) and numeric message IDs
 * used by the messaging service.
 * 
 * Mapping based on the database schema:
 * - Admin: U001 → 1
 * - Drivers: U002 → 2, U003 → 3, etc.
 * - Parents: U004 → 101, U005 → 102, etc.
 */

/**
 * Convert string UserID to numeric message ID
 * @param userId - String UserID (e.g., "U001", "U002")
 * @returns Numeric ID for messaging service
 */
export function userIdToMessageId(userId: string | number): number {
    // If already a number, return it
    if (typeof userId === 'number') {
        return userId;
    }

    // Remove 'U' prefix and convert to number
    const numericPart = parseInt(userId.replace(/^U/, ''), 10);

    if (isNaN(numericPart)) {
        console.error(`Invalid UserID format: ${userId}`);
        return 0;
    }

    // Mapping logic based on database schema
    // U001 (Admin) → 1
    // U002, U003 (Drivers) → 2, 3
    // U004, U005 (Parents) → 101, 102

    if (numericPart === 1) {
        // Admin
        return 1;
    } else if (numericPart >= 2 && numericPart <= 3) {
        // Drivers: U002 → 2, U003 → 3
        return numericPart;
    } else if (numericPart >= 4) {
        // Parents: U004 → 101, U005 → 102, etc.
        return 100 + (numericPart - 3);
    }

    // Fallback
    console.warn(`Unexpected UserID: ${userId}, using numeric part: ${numericPart}`);
    return numericPart;
}

/**
 * Convert numeric message ID back to string UserID
 * @param messageId - Numeric message ID
 * @returns String UserID (e.g., "U001", "U002")
 */
export function messageIdToUserId(messageId: number): string {
    if (messageId === 1) {
        // Admin
        return 'U001';
    } else if (messageId >= 2 && messageId <= 3) {
        // Drivers
        return `U00${messageId}`;
    } else if (messageId >= 101) {
        // Parents: 101 → U004, 102 → U005
        const userNum = messageId - 100 + 3;
        return `U00${userNum}`;
    }

    // Fallback
    console.warn(`Unexpected messageId: ${messageId}`);
    return `U${String(messageId).padStart(3, '0')}`;
}

/**
 * Validate if a UserID is valid
 * @param userId - UserID to validate
 * @returns true if valid, false otherwise
 */
export function isValidUserId(userId: string): boolean {
    return /^U\d{3}$/.test(userId);
}

/**
 * Get user role from UserID
 * @param userId - String UserID
 * @returns Role name
 */
export function getUserRole(userId: string): 'admin' | 'driver' | 'parent' | 'unknown' {
    const numericPart = parseInt(userId.replace(/^U/, ''), 10);

    if (numericPart === 1) return 'admin';
    if (numericPart >= 2 && numericPart <= 3) return 'driver';
    if (numericPart >= 4) return 'parent';

    return 'unknown';
}
