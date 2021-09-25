<template>
  <div class="MainContainer">
    <div class="lionDiv">
      <img class="LionImage" src="/images/LazyLions.png" />
    </div>
  
    <div class="InfoBlock claim">
      <h1 class='edo MainTitle black'>CLAIM YOUR<br/>BUNGALOW</h1>
      <div class="claimRemainsWrapper">
        <h3 class="h3Display black"> You Have <strong>{{ claimsLeft }}</strong> left to Claim </h3>
      </div>
      <p class="info black"> FREE for all Lazy Lions holders.<br/>You just pay for the gas fee.</p>
      <p class="info black">Claim one at a time or all of your<br/>Bungalows at once.</p>
      <p class="info black">Bungalows must be claimed by 09/27.<br/>Unclaimed Bungalows will be lost forever!</p>
      
      <div class="ButtonWrapper" v-if="!mintOpenFree">
        <button class="ClaimButton bg-black" disabled>Drop is Not Open, Yet</button>
      </div>
      <div class="ButtonWrapper" v-else-if="claimsLeft > 0">
        <button class="ClaimButton bg-black" @click='claimOne()'>Claim One</button>
        <button class="ClaimButton bg-gold" @click='claimAll()'>Claim All</button>
      </div>

      <div class="ButtonWrapper" v-else-if="claimsLeft == 0">
        <button class="ClaimButton bg-black" disabled>Address is not eligible to claim</button>
      </div>
    </div>

    <div class="Copyright">
      &copy; Blockchain Media Pty Ltd
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'Home',
  computed: {
    ...mapGetters('drizzle', ['drizzleInstance']),
    ...mapGetters('contracts', ['getContractData', 'contractInstances']),
    ...mapGetters('accounts', ['activeAccount', 'activeBalance']),
    claimsLeft() {
      let dataKey = this.drizzleInstance
        .contracts['LazyBungalows']
        .methods['freeMints']
        .cacheCall(this.activeAccount)
      let left = this.contractInstances['LazyBungalows']['freeMints'][dataKey]
      if (left == undefined || left.value == null) {
        return 0
      }
      console.log(left)
      return left.value
    },
    mintOpenFree() {
      let dataKey = this.drizzleInstance
        .contracts['LazyBungalows']
        .methods['openFree']
        .cacheCall()

      let isOpen = this.contractInstances['LazyBungalows']['openFree'][dataKey]
      if (isOpen == undefined) return false

      console.log(isOpen.value)
      return isOpen.value
    }
  },
  methods: {
    claimAll() {
      if(this.claimsLeft == 0) {
        return
      }
      this.drizzleInstance
      .contracts['LazyBungalows']
      .methods['mintFree']
      .cacheSend({from: this.activeAccount})
    },
    claimOne() {
      if(this.claimsLeft == 0) {
        return
      }
      this.drizzleInstance
      .contracts['LazyBungalows']
      .methods['mintFreeOne']
      .cacheSend({from: this.activeAccount})
    }
  },
  beforeCreate: function() {
    document.body.className = 'claim'
  }
}
</script>

<style lang="scss">
body.claim {
  background: white url('../../public/images/bungalows-claim-bg.png') no-repeat fixed center;
  background-size: cover;
  background-position: 75%;
  height: 100%;
}

.MainContainer {
  max-width: 1024px;
  width: 100%;
  margin: 0 auto;

  display: flex;
  justify-content: space-between;

  @media (max-width: 768px) {
    display: block;
    padding: 1 rem;
  }
}

.Copyright {
  position: absolute;
  right: 2rem;
  bottom: 1rem;
  color: #000;
  font-family: 'NunitoSans-Regular';
  @media (max-width: 768px) {
    position: relative;
    text-align: center;
    right: auto;
  }
}
.h3Display {
  font-family: 'NunitoSans-Regular';
  font-size: 2rem;
}
.claimRemainsWrapper {
  margin-bottom: 3rem;
}
.InfoBlock {
  text-align: center;
  display: block;
  @media (min-width: 768px) {
    margin-bottom: 2rem;
  }
}
Infoblock.claim{
  margin-right: 15rem;
}

.MainTitle {
  font-size: 5.625rem;
  font-weight: 400;
  line-height: 5rem;
  margin: 5rem 0 2rem 0;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 3.75rem;
    line-height: 3.5rem;
    margin: 2rem 0;
  }
}
.ButtonWrapper {
  margin: 2.5rem 0;
}
.ClaimButton {
  position: relative;
  overflow: hidden;
  font-weight: 900;
  font-size: 1.375em;
  border-radius: 999px;
  border: 0;
  color: #FFF;
  text-transform: uppercase;

  padding: 1.25rem 3rem;
  margin: 1rem .625rem;

  box-shadow: 0 0 1rem .75rem rgba(0, 0, 0, .33);

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

  &:focus{
    outline:0;
  }

  &:disabled {
    background-color: #444!important;
  }
}
.info {
  font-family: 'NunitoSans-Regular';
  font-size: 1.25rem;
}

.lionDiv {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  @media (max-width: 768px) {
    display: block;
    text-align: center;
  }
}

.LionImage {
  max-width: 28rem;
  max-height: 90vh;

  @media (max-width: 768px) {
    max-width: 40%;
  }
}

</style>
