<template>
  <div class="cardWrap" :class="{'valid' : valid}" :style="{
      background: systemSettings.showBank ? visual.backgroundGradient : ''
    }">
    <form @submit.prevent="onBtn" :class="systemSettings.showBank ? bankInfo.backgroundLightness : ''">
      <div class="bankLogo">
        <img v-if="systemSettings.showBank" :src="getImage(bankInfo.bankLogo)"/>
        <!-- <img src="~/card-info/dist/banks-logos/ru-tinkoff.svg"/> -->
      </div>
      <div class="row">
        <label for="cardnumber">{{systemSettings.labels.cardNumber}}</label>
        <input type="phone"
          :placeholder="systemSettings.placeholders.cardNumber" maxlength="23"
          v-model="card.number" name="cardnumber" autocomplete="cc-number"
          @keydown="isNumber"
        />
      </div>
      <div class="row">
        <div class="part">
          <label for="cc-exp-month">{{systemSettings.labels.month}}</label>
          <input type="number" :placeholder="systemSettings.placeholders.month"
            :min="this.card.year == getCurrYear() ? getCurrMonth() : 1" max="12"
            v-model="card.month" name="cc-exp-month"
            autocomplete="cc-exp" @keydown="isNumber" @blur="trailingZero"
            />
        </div>
        <div class="part sepLine">
          <span></span>
        </div>
        <div class="part">
          <label for="cc-exp">{{systemSettings.labels.year}}</label>
          <input type="number" :placeholder="systemSettings.placeholders.year"
            :min="getCurrYear()" max="99" name="cc-exp" v-model="card.year"
            autocomplete="cc-exp" @keydown="isNumber" @blur="trailingZero"
          />
        </div>
        <div class="part right">
          <label for="cvc">{{ bankInfo.codeName ? bankInfo.codeName : 'CVV' }}</label>
          <input type="password" :placeholder="systemSettings.placeholders.cvv"
            name="cvc" v-model="card.cvv" maxlength="3" autocomplete="cc-cvc"
            @keydown="isNumber"
          />
        </div>
      </div>
      <div class="row">
        <label for="ccname">{{systemSettings.labels.cardHolder}}</label>
        <input type="text" :placeholder="systemSettings.placeholders.cardHolder"
          name="ccname" v-model="card.name" autocomplete="cc-name" @keydown="onlyLetters"
          />
        <img v-if="systemSettings.showPaymentSystem" :src="getImage(bankInfo.brandLogo)" class="brandLogo right"/>
      </div>
      <div class="submit">
        <button type="submit">{{systemSettings.labels.button}}</button>
      </div>
    </form>
  </div>
</template>

<script>
import * as CardValidator from 'card-validator'
import CardInfo from 'card-info'

// get all logos file from card-info plugin to use it further
const LogosRaw = require.context('card-info/dist/', true, /\.png/)
const LogosRawSvg = require.context('card-info/dist/', true, /\.svg/)
const Logos = {}

LogosRaw.keys().forEach(function (key) {
  const base64 = LogosRaw(key)
  Logos[key] = base64
})

 // exception keys are: space, enter, backspace, left arrow, up arrow, right arrow, down arrow
const exceptionKeys = [32, 13, 8, 37, 38, 39, 40]

// if there are svg, ovverride png
LogosRawSvg.keys().forEach(function (key) {
  const base64 = LogosRawSvg(key)
  Logos[key] = base64
})

const defaults = {
  labels: {
    cardNumber: 'Card number',
    month: 'Month',
    year: 'Year',
    cardHolder: 'Cardholder name',
    button: 'pay'
  },

  placeholders: {
    cardNumber: '0000 0000 0000 0000',
    month: '00',
    year: '00',
    cardHolder: 'JOHN DOE',
    cvv: '000'
  },

  showBank: true,
  showPaymentSystem: true
}

export default {
  name: 'VueCardPayment',
  props: {
    settings: {
      type: Object,
      default: Object
    }
  },

  created: function () {
    CardInfo.setDefaultOptions(this.visual)
    this.systemSettings = Object.assign({}, defaults, this.settings)
  },

  data () {
    return {
      systemSettings: {},

      card: {
        number: '',
        name: '',
        month: '',
        year: '',
        cvv: ''
      },

      bankInfo: {},

      visual: {
        backgroundColor: '#eee',
        backgroundGradient: 'linear-gradient(135deg, #eeeeee, #dddddd)',
        banksLogosPath: 'banks-logos/',
        brandsLogosPath: 'brands-logos/'
      },

      valid: false
    }
  },

  methods: {
    getImage (path) {
      if (path) {
        return Logos['./' + path]
      }
    },

    validateMonth () {
      const currYear = this.getCurrYear()
      const currMonth = this.getCurrMonth()

      if (this.card.year === currYear && parseInt(this.card.month) < currMonth) {
        this.card.month = currMonth < 10 ? '0' + currMonth : currMonth
      }
    },

    validateYear () {
      const currYear = this.getCurrYear()

      if (this.card.year.toString().length > 2) this.card.year = this.card.year.toString().substring(0, 2)
      if (parseInt(this.card.year) < currYear && this.card.year.length > 1) this.card.year = currYear
    },

    getCurrYear () {
      return parseInt(new Date().getFullYear().toString().substr(2))
    },

    getCurrMonth () {
      return new Date().getMonth()
    },

    passData () {
      const obj = this.card
      obj.valid = this.valid

      this.$emit('input', obj)
    },

    onBtn () {
      if (this.valid) {
        this.$emit('card-submit')
      }
    },

    isNumber (evt) {
      evt = (evt) || window.event
      const charCode = (evt.which) ? evt.which : evt.keyCode
      if (
        (charCode > 31 && ((charCode < 48 || charCode > 57) && (charCode < 96 || charCode > 105))) &&
        exceptionKeys.indexOf(charCode) === -1) {
        evt.preventDefault()
      } else {
        return true
      }
    },

    onlyLetters (evt) {
      evt = (evt) || window.event
      const charCode = (evt.which) ? evt.which : evt.keyCode

      // additional exceptions: ,-'.
      const exceptionKeysName = exceptionKeys.concat([188, 189, 222, 190])

      if (!(charCode >= 65 && charCode <= 120) &&
         exceptionKeysName.indexOf(charCode) === -1) {
        evt.preventDefault()
      } else {
        return true
      }
    },

    trailingZero (evt) {
      const val = evt.target ? evt.target.value : evt

      if (parseInt(val, 10) < 10 && val.toString().charAt('0') !== '0') {
        if (evt.target.name === 'cc-exp') {
          this.card.year = `0${val}`
          this.validateYear()
        } else if (evt.target.name === 'cc-exp-month') {
          this.card.month = `0${val}`
          this.validateMonth()
        }
      }
    }
  },

  watch: {
    'card.number' () {
      this.bankInfo = new CardInfo(this.card.number)
      let niceNumber = this.bankInfo.numberNice

      if (niceNumber.length > 19) niceNumber = niceNumber.slice(0, 19) + ' ' + niceNumber.slice(19)

      this.card.number = niceNumber
    },

    'bankInfo' (newVal) {
      this.visual.backgroundGradient = newVal.backgroundGradient
    },

    'card.name' () {
      this.card.name = this.card.name.toUpperCase().replace(/[^A-Z\s'-,.]/g, '')
    },

    'card.month' (newVal) {
      // limit chars to 2
      if (this.card.month.toString().length > 2) this.card.month = this.card.month.toString().substring(0, 2)
      if (parseInt(this.card.month) > 12) this.card.month = 12
      if (newVal.length > 1) this.validateMonth()
    },

    'card.cvv' (val) {
      this.card.cvv = val.replace(/\D/g, '')
    },

    'card.year' (newVal) {
      this.validateYear()
      this.validateMonth()
    },

    'card': {
      handler () {
        const validName = this.card.name && this.card.name.search(' ') > 0

        this.valid = (
          CardValidator.number(this.card.number).isValid &&
          CardValidator.expirationMonth(this.card.month).isValid &&
          CardValidator.expirationYear(this.card.year, new Date().getFullYear().toString().substring(2)).isValid &&
          CardValidator.cvv(this.card.cvv).isValid &&
          validName
        )

        this.passData()
      },

      deep: true
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .cardWrap {
    width: 420px;
    height: 280px;
    position: relative;
    margin: 0 auto;
    padding: 15px 35px;
    background: #f9f9f9;
    border-radius: 34px;
    border: 1px solid #dbdbdb;
    text-align: left;
  }

  .cardWrap .info {
    overflow: hidden;
  }

  .cardWrap .row {
    position: relative;
    height: 40px;
    margin: 9px 0;
  }

  .cardWrap form {
    margin: 5px 0;
  }

  .cardWrap label {
    position: absolute;
    color: #9b9b9b;
    font-size: 10px;
    top: 6px;
    left: 24px;
    z-index: 1;
  }

  .cardWrap input {
    padding: 14px 22px 0;
    height: 40px;
    border: 1px solid #dbdbdb;
    box-shadow: none;
    width: 100%;
  }

  .cardWrap .part {
    width: 80px;
    display: inline-block;
    position: relative;
  }

  input:not([type=radio]):not([type=checkbox]) {
    border-radius: 20px;
    font-size: 14px;
    outline: 0;
    box-sizing: border-box;
    -webkit-appearance: none;
  }

  .cardWrap .sepLine {
    width: 18px;
  }

  .cardWrap .right {
    float: right;
  }

  .cardWrap .whatIsIt {
    background: #2679ff;
    border-radius: 100px;
    width: 23px;
    height: 23px;
    position: absolute;
    bottom: -4px;
    right: -7px;
    color: #fff;
    line-height: 25px;
    font-size: 14px;
  }

  .cardWrap .submit {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    border-bottom-left-radius: 34px;
    border-bottom-right-radius: 34px;
    text-align: center;
    transition: 0.3s border linear, 0.3s background linear;
  }

  .cardWrap button {
    border: 1px solid #fff;
    background: #d6d2d2;
    box-shadow: none;
    margin: 15px;
    height: 32px;
    width: 160px;
    border-radius: 20px;
    color: #fff;
    outline: none;
    font-size: 14px;
    cursor: not-allowed;
    transition: 0.3s color linear, 0.3s background linear;
  }

  .cardWrap .info {
    overflow: hidden;
  }

  .cardWrap .text {
    color: #9b9b9b;
    margin: 12px 0 0;
    padding: 0 22px;
    line-height: 22px;
  }

  .cardWrap .sum {
    font-size: 32px;
    float: right;
    margin: -41px 0 0;
  }

  input::-webkit-inner-spin-button {
    display: none;
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    transition: background-color 5000s ease-in-out 0s;
    background-color: #fff;
  }

  .cardWrap.valid .submit {
    background: transparent;
    border-top: 1px solid #dbdbdb;
  }

  .cardWrap.valid button {
    color: #fff;
    background: #6cc067;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 1px 1px 0 1px #437d3f;
    border: 0;
  }

  .cardWrap.valid button:active {
    box-shadow: -1px -1px 0 1px #437d3f;
    top: 1px;
    left: 1px;
  }

  .cardWrap input.invalid {
    border-color: #a500009c;
  }

  .bankLogo,
  .bankLogo img {
    height: 56px;
  }

  .brandLogo {
    height: 40px;
    margin: 12px 0 0;
  }

  .dark input:not([type=radio]):not([type=checkbox]) {
    background: transparent;
    color: #fff;
    border: none;
  }

  .dark input:-webkit-autofill,
  .dark input:-webkit-autofill:hover,
  .dark input:-webkit-autofill:focus,
  .dark input:-webkit-autofill:active {
    -webkit-text-fill-color: #fff !important;
  }

  .dark label {
    color: #ccc8c8;
  }

  .dark input::-webkit-input-placeholder {
    color: #fff;
  }

  .valid .dark .submit {
    border-top: none;
  }

  .dark .brandLogo {
    margin: -28px 0 0;
  }

  .dark button {
    background: 0 0;
  }

</style>
