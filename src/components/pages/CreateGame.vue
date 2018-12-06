<template>
  <div>
    <v-form ref="create-game-form">
      <p class="display-1">Create Game</p>
      <v-text-field />
    </v-form>
    <v-btn>deposit tokens</v-btn>
    <v-btn>clear</v-btn>
  </div>
</template>

<script>
import * as VForm from 'vuetify/es5/components/VForm'
import * as VTextField from 'vuetify/es5/components/VTextField'
import * as VBtn from 'vuetify/es5/components/VBtn'

export default {
  components: {
    ...VForm,
    ...VTextField,
    ...VBtn
  }
}
</script>
