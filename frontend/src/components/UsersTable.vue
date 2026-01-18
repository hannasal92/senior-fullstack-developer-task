<template>
  <table class="users-table">
    <thead>
      <tr>
        <th>id</th>
        <th>Username</th>
        <th>Roles</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in users" :key="user.id">
        <td>{{ user.id }}</td>
        <td>{{ user.username }}</td>
        <td>{{ user.roles.join(', ') }}</td>
        <td>
          <span :class="['status', user.status.toLowerCase()]">
            {{ user.status }}
          </span>
        </td>
        <td class="actions">
          <button
            v-if="!disableEdit"
            class="edit"
            @click="$emit('edit', user)"
          >
            Edit
          </button>
          <button
            v-if="!disableDelete"
            class="delete"
            @click="$emit('delete', user.id)"
          >
            Remove
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({
  users: {
    type: Array,
    required: true,
  },
  disableEdit: {
    type: Boolean,
    default: false,
  },
  disableDelete: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.users-table th,
.users-table td {
  padding: 0.8rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.users-table thead {
  background: #f3f4f6;
}

.status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status.enabled {
  background: #dcfce7;
  color: #166534;
}

.status.disabled {
  background: #fef3c7;
  color: #92400e;
}

.status.deleted {
  background: #fee2e2;
  color: #991b1b;
}

.actions button {
  margin-right: 8px;
  padding: 4px 10px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.actions .edit {
  background: #22c55e;
  color: white;
}

.actions .delete {
  background: #ef4444;
  color: white;
}
</style>