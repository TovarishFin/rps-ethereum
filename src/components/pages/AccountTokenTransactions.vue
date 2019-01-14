<template>
  <span>
    <token-usage-table />
    <bank-activity-timeline />
  </span>
</template>

<script>
import TokenUsageTable from '@/components/TokenUsageTable'
import BankActivityTimeline from '@/components/BankActivityTimeline'

export default {
  components: {
    TokenUsageTable,
    BankActivityTimeline
  }
}
</script>
