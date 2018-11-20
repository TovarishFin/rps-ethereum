<template>
  <v-container fluid>
    <v-layout column align-center>
      <v-flex xs4>
        <img :src="require('../../assets/metamask.png')" aspect-ratio="1" />
      </v-flex>
      <v-flex xs12>
        <p class="display-1 text-uppercase">
          Install Metamask or Unlock your account to get started...
        </p>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import * as VImg from 'vuetify/es5/components/VImg'

export default {
  components: {
    ...VImg
    // ...VSpacer
  }
}
</script>
<style scoped></style>
