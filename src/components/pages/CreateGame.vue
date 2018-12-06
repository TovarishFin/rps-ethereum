<template>
  <div>
    <v-form ref="create-game-form">
      <p class="display-1">Create Game</p>
      <v-text-field
        v-model="tokenAddress"
        label="token address"
        :placeholder="addressZero"
        type="text"
        required
      />
      <v-text-field
        v-model="betAmount"
        label="bet amount"
        placeholder="1"
        type="number"
        required
      />
    </v-form>
    <v-btn>deposit tokens</v-btn>
    <v-btn>clear</v-btn>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as VForm from 'vuetify/es5/components/VForm'
import * as VTextField from 'vuetify/es5/components/VTextField'
import * as VBtn from 'vuetify/es5/components/VBtn'

export default {
  components: {
    ...VForm,
    ...VTextField,
    ...VBtn
  },
  data() {
    return {
      betAmount: '',
      tokenAddress: ''
    }
  },
  computed: {
    ...mapGetters(['tokenDataOf'])
  },
  methods: {
    ...mapActions(['createGame'])
  }
}
</script>
