<template>
<div class="PageContainer">
<div class="MainContainerMint">
  <b-col xl='6'>
    <div class="InfoBlock">
      <h1 class="edo black MainTitle">BUNGALOW<br/>PRESALE</h1>
      <div class="ProgressWrapper">
        <div class="ProgressBarWrapper">
          <div class="ProgressBar" :style="buyableRemaining">
            {{ buyableRemaining.width }}
          </div>
        </div>
      </div>
      <p class="info black">Join the Lazy Lions Private Island<br/>with a Bungalow banner image NFT.</p>
      <p class="info black">Limited public presale of 1,500 banners<br/>at {{ displayPrice }} ETH each + gas.</p>
    </div>
  </b-col>
  <b-col xl='6'>
    <div class="mintForm">
    <form ref="PurchaseForm" @submit.stop.prevent="onSubmit">
      <b-form-input 
        class="InputCount"
        id="purchaseAmount"
        :state="validAmount"
        v-model="amount"
        type="number"
        min="1"
        step="1"
        max="5"
      />
    </form>
      <div class="LabelTotal black">TOTAL</div>
      <div class="LabelCost black">{{ displayCost() }}</div>
      <div class="LabelGas black">+ GAS</div>
      <button class="MintButton" @click='onSubmit()' :disabled="buyableRemaining.width === '100%' || !mintOpen || lastTxStatus() =='pending' ">
        {{buttonText}}
      </button> 
    </div>
  </b-col>
</div>
<div class="Copyright">
    &copy; Blockchain Media Pty Ltd
  </div>
</div>
</template>
<script>
import { mapGetters } from 'vuex';
export default {
  name: 'Mint',
  computed: {
    ...mapGetters('drizzle', ['drizzleInstance']),
    ...mapGetters('contracts', ['getContractData', 'contractInstances']),
    ...mapGetters('accounts', ['activeAccount', 'activeBalance']),
    buyableRemaining() {
      let datakey = this.drizzleInstance
        .contracts['LazyBungalows']
        .methods['bought']
        .cacheCall()

      let bought = this.contractInstances['LazyBungalows']['bought'][datakey]

      if (bought == undefined) return 0;
      let buyable = 1500
      let perc = (bought.value / buyable)*100
      console.log('bought: ', bought.value, perc.toString())
      return {
        width: perc.toFixed(0).toString()+"%"
      }
      

    },
    displayPrice() {
      let price = this.getBasePrice()
      if (!(price>=0)) {
        return ''
      }
      return this.drizzleInstance.web3.utils.fromWei(price, 'ether')
    },
    mintOpen() {
      let dataKey = this.drizzleInstance
        .contracts['LazyBungalows']
        .methods['open']
        .cacheCall()

      let isOpen = this.contractInstances['LazyBungalows']['open'][dataKey]
      if (isOpen == undefined) return false

      console.log(isOpen.value)
      return isOpen.value
    },
    
    buttonText() {
        if (this.buyableRemaining.width === '100%'){
            return 'Sold Out'
        } else if (!this.mintOpen) {
            return 'Sale Not Active'
        } else if (this.lastTxStatus() == 'pending') {
            return 'Pending...'
        } else {
            return 'Mint'
        }
    }
  },
  methods: {
    lastTxStatus() {
        if (this.drizzleInstance.store.getState().transactionStack.length == 0) {
            return
        }
        let tx = this.drizzleInstance.store.getState().transactionStack.at(-1);
        let receipt = this.drizzleInstance.store.getState().transactions[tx]
        if (receipt == undefined) return
        if (receipt.status == 'error') return
        console.log('conf status', receipt)
        if (receipt.confirmations.length > 0) {
            if (receipt.confirmations[0].status == false) return
        }
        
        // console.log('txhash', tx)
        // console.log('tx hash', receipt)
        // console.log('status', receipt.status)


        return receipt.status
    },
    mintOpenCheck() {
      let dataKey = this.drizzleInstance
        .contracts['LazyBungalows']
        .methods['open']
        .cacheCall()

      let isOpen = this.contractInstances['LazyBungalows']['open'][dataKey]
      if (isOpen == undefined) return false

      console.log(isOpen.value)
      return isOpen.value
    },
    checkFormValidity() {
      let valid = this.$refs.PurchaseForm.checkValidity()
      this.validAmount = valid
      if (valid) {
        const weiBalance = this.drizzleInstance.web3.utils.toBN(this.activeBalance)
        let totalCost = this.calculateCost()
        if(totalCost.gte(weiBalance)) {
          valid = false;
          this.validAmount = false;
          return valid
        }
        return valid
      }
      this.onReset()
      return valid
    },
    onSubmit() {
      if (!this.checkFormValidity()) {
        return 
      }
      if(!this.mintOpenCheck()){
          return
      }
      let cost = this.calculateCost()
      console.log(cost)
      this.drizzleInstance
      .contracts['LazyBungalows']
      .methods['mint']
      .cacheSend(this.amount, {from: this.activeAccount, value: cost})

      this.$forceUpdate()
    },
    onReset() {
      this.amount = '1'
      this.validAmount = null
    },
    getBasePrice() {
      let dataKey = this.drizzleInstance
        .contracts['LazyBungalows']
        .methods['mintPrice']
        .cacheCall()

      let cachedData = this.contractInstances['LazyBungalows']['mintPrice'][dataKey]
      if (cachedData == undefined) return undefined

      return cachedData.value
    },
    displayCost() {
      let cost = this.calculateCost()
      if (!(cost>=0)) {
          return '0'
      }
      return this.drizzleInstance.web3.utils.fromWei(cost)
    },
    calculateCost() {
      let basePrice = this.getBasePrice()
      if (basePrice == undefined) {
        return this.drizzleInstance.web3.utils.toBN('0')
      }
      let price = this.drizzleInstance.web3.utils.toBN(basePrice.toString())
      let total = price.mul(this.drizzleInstance.web3.utils.toBN(this.amount))
      return total
    },
    
  },
  data: () => ({
    amount: '1',
    validAmount: null,
  }),
  beforeCreate: function() {
    document.body.className = 'mint'
  }

}
</script>
<style lang='scss'>
body.mint {
  background: white url('../../public/images/bungalows-mint-bg.png') no-repeat fixed center;
  background-size: cover;
  background-position: 100%;
  height: 100%;
}
.MintButton {
  appearence: auto;
  font: 400 13.3333px Arial;
  align-items: flex-start;
  display: inline-block;
  position: relative;
  overflow: hidden;
  font-weight: 900;
  font-size: 2.625em;
  border-radius: 999px;
  border: 0;
  color: #FFF;
  text-transform: uppercase;
  background-color: #000;

  padding: 1.25rem 7.5rem;
  margin: 4rem 0 1rem;

  box-shadow: 0 0 1rem .75rem rgba(0, 0, 0, .33);

  @media (max-width: 768px) {
    padding: .5rem 3.75rem;
    margin: 2rem 0;
  }

  &:after {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    bottom: -50%;
    left: -50%;
    background: linear-gradient(to bottom, rgba(229, 172, 142, 0), rgba(255,255,255,0.5) 50%, rgba(229, 172, 142, 0));
    transform: rotateZ(60deg) translate(-5em, 7.5em);
  }

  &:hover::after, &:focus:after {
    animation: sheen 1s forwards;
  }

  @keyframes sheen {
    100% {
      transform: rotateZ(60deg) translate(1em, -9em);
    }
  }

  &:active{
    transform: translate(0, 2px);
    color: #FFF;
    background-color: #000;
  }

  &:disabled{
    background-color: #444;
  }

  &:focus{
    outline:0;
  }
}
.LabelTotal {
  font-family: NunitoSans-Bold, sans-serif;
  font-size: 1.625rem;
}
.LabelCost {
  font-family: NunitoSans-Bold, sans-serif;
  font-size: 3.75rem;
}
.LabelGas {
  font-family: NunitoSans-Bold, sans-serif;
  font-size: 1.625rem;
}
.InputCount {
  border: none !important;
  background-color: #FFF !important;
  color: #000 !important;

  font-family: NunitoSans-Bold, sans-serif;
  font-size: 3.75rem !important;
  width: 11rem !important;
  text-align: center;
  outline: none;
  height: 4.75rem;

  padding: .5rem !important;
  padding-bottom: 0.25 !important;
  margin: 5rem 10rem;
  margin-top: 1rem !important;
  margin-bottom: 5rem;
  margin-left: 11rem;

  @media (max-width: 768px) {
    margin: 2rem 0;
  }

  box-shadow: 0 0 1rem .75rem rgba(0, 0, 0, .33);
}
.mintForm {
  text-align: center;
  padding-top: 1rem;

  @media (min-width: 768px) {
    padding-top: 5rem;
  }
}
.PageContainer {
  width: 100%;
  max-width: 1024px;
  margin: 0 auto
  }
.Label {
  font-family: NunitoSans-Bold, sans-serif;
}
.MainContainerMint {
  display: flex;
  justify-content: space-around;
  height: 100%;
  width:100%;
  max-width: 1024;
  margin: 0 auto;
  -webkit-box-pack: justify;

  @media (max-width: 768px) {
    display: block;
    padding: 1 rem;
  }
}
.ProgressWrapper {
  margin-bottom: 5.25rem;
  margin-right: 8rem;
  margin-left: 8rem;
  @media (max-width: 768px) {
    margin-right: 4rem;
    margin-left: 4rem;

    margin-bottom: 2rem;
  }
}
.ProgressBarWrapper {
  display: flex;
  height: 1.25rem;
  overflow: hidden;
  line-height: 0;
  font-size: .625rem;
  background-color: #FFF;
  border-radius: 999px;
}
.ProgressBar {
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  color: #FFF;
  text-align: center;
  white-space: nowrap;
  background-color: #000;
  transition: width .6s ease;
  border-radius: 999px;
  min-width: 1.5rem;

  font-family: NunitoSans-Bold, sans-serif;
  width: 10%;
}
</style>

<style lang="scss" scoped>
#purchaseAmount {
  @media (max-width: 768px) {
    margin: 2rem auto;
  }
}
</style>
