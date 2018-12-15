<template>
  <span>
    <referral-link-generator />
    <account-referral-stats />
  </span>
</template>

<script>
import ReferralLinkGenerator from '@/components/ReferralLinkGenerator'
import AccountReferralStats from '@/components/account/AccountReferralStats'

export default {
  components: {
    ReferralLinkGenerator,
    AccountReferralStats
  }
}
</script>
