<template>
  <div class="mt-4">
    <p class="display-1">Referral Payment History</p>
    <p class="headline">
      Total Payments (all tokens/ether): {{ weiToEth(referralPaymentTotal) }}
    </p>
    <p class="headline">
      Total Payments for selected items: {{ weiToEth(sortedPaymentsTotal) }}
    </p>

    <v-card class="mt-4">
      <v-card-title>
        Past Referral Payments
        <v-spacer />
        <v-combobox
          v-model="paymentSearch"
          append-icon="search"
          label="search for payments"
          single-line
          hide-details
          :items="tokenDataArray"
          item-text="symbol"
          item-value="address"
          :return-object="false"
        />
      </v-card-title>
      <v-data-table
        v-model="sortedPayments"
        :headers="paymentHeaders"
        :items="referralPayments"
        :search="paymentSearch"
        class="elevation-1 mb-4"
        :pagination.sync="pagination"
      >
        <template slot="items" slot-scope="props">
          <td class="text-xs-left">{{ props.item.blockNumber }}</td>
          <td class="text-xs-left">{{ weiToEth(props.item.value) }}</td>
          <td class="text-xs-left">
            {{ shortenAddress(props.item.referred) }}
          </td>
          <td class="text-xs-left">
            {{ shortenAddress(props.item.tokenAddress) }}
          </td>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { toBN } from 'web3-utils'
import * as VCombobox from 'vuetify/es5/components/VCombobox'
import * as VDataTable from 'vuetify/es5/components/VDataTable'
import * as VCard from 'vuetify/es5/components/VCard'

export default {
  components: {
    ...VCombobox,
    ...VDataTable,
    ...VCard
  },
  data() {
    return {
      pagination: {
        rowsPerPage: -1
      },
      paymentSearch: '',
      sortedPayments: [],
      paymentHeaders: [
        {
          text: 'Block Number',
          value: 'blockNumber'
        },
        {
          text: 'Pay Amount',
          value: 'value'
        },
        {
          text: 'Referred Address',
          value: 'referred'
        },
        {
          text: 'Token Address',
          value: 'tokenAddress'
        }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'referralPayments',
      'referralPaymentTotal',
      'tokenDataArray'
    ]),
    // TODO: FIX THIS SO THAT IT CAN BE SORTED BY TOKEN FOR PAYMENT TOTALS
    sortedPaymentsTotal() {
      return this.sortedPayments
        .reduce((total, payment) => total.add(toBN(payment.value)), toBN(0))
        .toString()
    }
  },
  methods: {
    ...mapActions(['getReferralPayments'])
  },
  // TODO: make this update every time entering
  mounted() {
    this.getReferralPayments()
  }
}
</script>
