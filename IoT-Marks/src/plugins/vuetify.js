import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    themes: {
      light: {
        colors: {
          'surface-dark': '#E0E0E0',
        },
      },
      dark: {
        colors: {
          'surface-dark': '#121212', 
        },
      },
    },
  },
})