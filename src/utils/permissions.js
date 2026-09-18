export function canManageUsers(role) { return role === 'admin'; }
export function canPublish(role) { return role === 'admin'; }
export function canEdit(item, user) { return user?.role === 'admin' || item?.author_id === user?.id; }
