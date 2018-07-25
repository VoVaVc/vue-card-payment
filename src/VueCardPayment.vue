<template>
  <div class="cardWrap" :class="{'valid' : valid}" :style="{
      background: visual.backgroundGradient
    }">
    <form @submit.prevent="onBtn" :class="bankInfo.backgroundLightness">
      <div class="bankLogo">
        <img :src="getImage(bankInfo.bankLogo)"/>
        <!-- <img src="~/card-info/dist/banks-logos/ru-tinkoff.svg"/> -->
      </div>
      <div class="row">
        <label>{{systemSettings.labels.cardNumber}}</label>
        <input type="phone" placeholder-char="_"
          :placeholder="systemSettings.placeholders.cardNumber" maxlength="23"
          v-model="card.number" name="cardnumber" autocomplete="cc-number"
          @keypress="isNumber"
        />
      </div>
      <div class="row">
        <div class="part">
          <label>{{systemSettings.labels.month}}</label>
          <input type="number" :placeholder="systemSettings.placeholders.month"
            min="1" max="12" maxlength="2" v-model="card.month"
            autocomplete="cc-exp" @keypress="isNumber"
            />
        </div>
        <div class="part sepLine">
          <span></span>
        </div>
        <div class="part">
          <label>{{systemSettings.labels.year}}</label>
          <input type="number" :placeholder="systemSettings.placeholders.year"
            min="0" max="99" maxlength="2" name="cc-exp" v-model="card.year"
            autocomplete="cc-exp" @keypress="isNumber"
          />
        </div>
        <div class="part right">
          <label>{{ bankInfo.codeName ? bankInfo.codeName : 'CVV' }}</label>
          <input type="password" :placeholder="systemSettings.placeholders.cvv"
            name="cvc" v-model="card.cvv" maxlength="3" autocomplete="cc-cvc"
            @keypress="isNumber"
          />
        </div>
      </div>
      <div class="row">
        <label>{{systemSettings.labels.cardHolder}}</label>
        <input type="text" :placeholder="systemSettings.placeholders.cardHolder" name="ccname" v-model="card.name" autocomplete="cc-name">
        <img :src="getImage(bankInfo.brandLogo)" class="brandLogo right"/>
      </div>
      <div class="submit">
        <button type="submit">{{systemSettings.labels.button}}</button>
      </div>
    </form>
  </div>
</template>

<script>
import * as CardValidator from 'card-validator';
import CardInfo from 'card-info';

// get all logos file from card-info plugin to use it further
const LogosRaw = require.context('card-info/dist/', true, /\.png/);
const LogosRawSvg = require.context('card-info/dist/', true, /\.svg/);
var Logos = {};

LogosRaw.keys().forEach(function(key){
  var base64 = LogosRaw(key);
  Logos[key] = base64;
});

// if there are svg, ovverride png
LogosRawSvg.keys().forEach(function(key){
  var base64 = LogosRawSvg(key);
  Logos[key] = base64;
});

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
  }
}

export default {
  name: 'VueCreditCard',
  props: {
    settings: {
      type: Object,
      default: Object
    }
  },

  created: function(){
    CardInfo.setDefaultOptions(this.visual);
    this.systemSettings = Object.assign(this.settings, defaults);
  },

  mounted: function(){

  },

  data() {
    return {
      systemSettings: {},

      card: {
        number: '',
        name: '',
        month: '',
        year: '',
        cvv: '',
      },

      bankInfo: {

      },

      visual: {
        backgroundColor: '#eee',
        backgroundGradient: 'linear-gradient(135deg, #eeeeee, #dddddd)',
        banksLogosPath: 'banks-logos/',
        brandsLogosPath: 'brands-logos/'
      },

      valid: false,
      errMsg: '',
    };
  },

  methods: {
    getImage(path){
      if(path){
        return Logos['./'+path];
      }
    },

    validateMonth(){
      var currYear = this.getCurrYear(),
          currMonth = new Date().getMonth();

      if(this.card.year == currYear && parseInt(this.card.month) < currMonth){
        this.card.month = currMonth < 10 ? '0'+currMonth : currMonth;
      }
    },

    getCurrYear(){
      return parseInt(new Date().getFullYear().toString().substr(2))
    },

    passData(){
      var obj = this.card;
      obj.valid = this.valid;

      this.$emit('input', obj);
    },

    onBtn(){
      this.$emit('card-submit')
    },

    isNumber: function(evt) {
      evt = (evt) ? evt : window.event;
      var charCode = (evt.which) ? evt.which : evt.keyCode;
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        evt.preventDefault();;
      } else {
        return true;
      }
    },
  },

  watch: {
    'card.number'(){
      this.bankInfo = new CardInfo(this.card.number);
      let niceNumber = this.bankInfo.numberNice;

      if(niceNumber.length > 19){
        niceNumber =  niceNumber.slice(0, 19) + ' ' + niceNumber.slice(19)
      }

      this.card.number = niceNumber;
    },

    'bankInfo'(newVal){
      this.visual.backgroundGradient = newVal.backgroundGradient;
    },

    'card.name'(){
      this.card.name = this.card.name.toUpperCase();
    },

    'card.month'(newVal){
      // limit chars to 2
      if(this.card.month.toString().length > 2){
        this.card.month = parseInt(this.card.month.toString().substring(0,2));
      }

      if(parseInt(this.card.month) > 12){
        this.card.month = 12;
      }

      if(newVal.length > 1){
        this.validateMonth();
      }
    },

    'card.cvv'(val){
      this.card.cvv = val.replace(/\D/g,'');
    },

    'card.year'(newVal){
      var currYear = this.getCurrYear();

      if(this.card.year.toString().length > 2){
        this.card.year = parseInt(this.card.year.toString().substring(0,2));
      }

      if(newVal < currYear && newVal.length > 1){
        this.card.year = currYear;
      }

      this.validateMonth();
    },

    'card': {
      handler(){
        this.valid = (
          CardValidator.number(this.card.number).isValid
          && CardValidator.expirationMonth(this.card.month).isValid
          && CardValidator.expirationYear(this.card.year, new Date().getFullYear().toString().substring(2)).isValid
          && CardValidator.cvv(this.card.cvv).isValid
          && this.card.name
        );

        this.passData();
      },

      deep: true
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .cardWrap
  {
    width: 420px;
    height: 280px;
    position: relative;
    margin: 0 auto;
    padding: 15px 35px;
    background: #F9F9F9;
    border-radius: 34px;
    border: 1px solid #DBDBDB;
    text-align: left;
  }

  .cardWrap .info
  {
    overflow: hidden;
  }

  .cardWrap .row {
    position: relative;
    height: 40px;
    margin: 9px 0;
  }

  .cardWrap form
  {
    margin: 5px 0;
  }

  .cardWrap label {
    position: absolute;
    color: #9B9B9B;
    font-size: 10px;
    top: 6px;
    left: 24px;
    z-index: 1;
  }

  .cardWrap input {
    padding: 14px 22px 0;
    height: 40px;
    border: 1px solid #DBDBDB;
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

  .cardWrap .whatIsIt
  {
    background: #2679FF;
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

  .cardWrap .submit
  {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    border-bottom-left-radius: 34px;
    border-bottom-right-radius: 34px;
    text-align: center;

    transition: .3s border linear, .3s background linear;
  }

  .cardWrap button {
    border: 1px solid #fff;
    background: 0 0;
    box-shadow: none;
    margin: 15px;
    height: 32px;
    width: 160px;
    border-radius: 20px;
    color: #fff;
    outline: none;
    font-size: 14px;
    cursor: not-allowed;

    transition: .3s color linear, .3s background linear;
  }

  .cardWrap .info {
    overflow: hidden;
  }

  .cardWrap .text {
        color: #9B9B9B;
    margin: 12px 0 0;
    padding: 0 22px;
    line-height: 22px;
  }

  .cardWrap .sum {
    font-size: 32px;
    float: right;
    margin: -41px 0 0;
  }

  input::-webkit-inner-spin-button
  {
    display: none;
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
      transition: background-color 5000s ease-in-out 0s;
      background-color: #fff;
  }

  .cardWrap.valid .submit
  {
    background: transparent;
    border-top: 1px solid #dbdbdb;
  }

  .cardWrap.valid button
  {
    color: #fff;
    background: #6cc067;
    font-weight: bold;
    cursor: pointer;

    color: #fff;
    background: #6cc067;
    font-weight: bold;
    box-shadow: 1px 1px 0px 1px #437d3f;
    border: 0;
  }

    .cardWrap.valid button:active
    {
      box-shadow: -1px -1px 0px 1px #437d3f;
      top: 1px;
      left: 1px;
    }

    .cardWrap input.invalid
    {
      border-color: #a500009c;
    }

    .bankLogo, .bankLogo img
    {
      height: 56px;
    }

    .brandLogo
    {
      height: 40px;
      margin: 12px 0 0;
    }

    .dark input:not([type=radio]):not([type=checkbox])
    {
      background: transparent;
      color: #fff;
      border: none;
    }

      .dark input:-webkit-autofill,
      .dark input:-webkit-autofill:hover,
      .dark input:-webkit-autofill:focus,
      .dark input:-webkit-autofill:active
      {
        -webkit-text-fill-color: #fff !important;
      }

      .dark label {
        color: #ccc8c8
      }

      .dark input::-webkit-input-placeholder
      {
        color: #fff;
      }

      .valid .dark .submit
      {
        border-top: none;
      }

      .dark .brandLogo
      {
        margin: -28px 0 0;
      }

.errMsg
{
  color: #a50000e0;
  font-size: 14px;
  text-align: right;
}
</style>
