<template>
  <div id="app">
    <div class="BodyWrapper">
      <NavBar />
      <div v-if="isDrizzleInitialized && web3Network >= NETWORK_ID">
        <div v-if="currentRoute == '/claim'">
          <Home />        
        </div>
        <div v-else-if="currentRoute =='/mint'">
          <Mint />
        </div>
        <div v-else-if="!freeMintOpen">
          <Mint />
        </div>
        <div v-else-if="claimsLeft">
          <Home />
        </div>
        <div v-else>
            <Mint />
        </div>
      </div>
      <div v-else>
        <center><h1>Please Connect to the Ethereum Main Network<br/>To Participate in the Lazy Bungalows Drop</h1></center>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import NavBar from './components/NavBar.vue'
import Home from './pages/Home.vue'
import Mint from './pages/Mint.vue'

export default {
  name: 'App',
  components: {
    NavBar,
    Home,
    Mint
  },
  data() {
    return {
      NETWORK_ID: 1
    }
  },
  computed: {
    ...mapGetters('drizzle', ['isDrizzleInitialized', 'drizzleInstance']),
    ...mapGetters('contracts', ['getContractData', 'contractInstances']),
    ...mapGetters('accounts', ['activeAccount', 'activeBalance']),
    web3Network() {
      return this.drizzleInstance.store.getState().web3.networkId
    },
    currentRoute() {
        console.log(window.location.pathname)
        return window.location.pathname
    },
    claimsLeft() {
      let dataKey = this.drizzleInstance
        .contracts['LazyBungalows']
        .methods['freeMints']
        .cacheCall(this.activeAccount)
      let left = this.contractInstances['LazyBungalows']['freeMints'][dataKey]
      console.log(left)
      if (left == undefined || left.value == null) {
        return false
      }
      console.log('claims')
      console.log(left)
      if (left.value > 0){
        return true
      } else {
        return false
      }
    },
    freeMintOpen() {
      let dataKey = this.drizzleInstance
        .contracts['LazyBungalows']
        .methods['openFree']
        .cacheCall()

      let isOpen = this.contractInstances['LazyBungalows']['openFree'][dataKey]
      if (isOpen == undefined) return false

      console.log(isOpen.value)
      return isOpen.value
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
    }
  }
}
</script>

<style lang='scss'>
/*.MainContainer {
  dislay: flex;
  padding: 5rem;
  justify-content: space-around;


  @media (max-width: 768px) {
    display: block;
    padding: 1rem;
  }
}
*/

html, body {
  background: white url('../public/images/bungalows-claim-bg.png') no-repeat fixed center;
  background-size: cover;
  background-position: 75%;
  height: 100%;
  font-size: 16px;

  @media (max-width: 1024px) {
    font-size: 12px;
  }
}
 #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  align-items: center;
  flex: 1;
 }
.BodyWrapper {
  @media (min-width: 768px) {
    width: 100%;
    height: 100%;
    align-items: center;
    flex: 1;
    overflow-y: hidden;
    overflow-x: hidden;
  }
}
.BackImage {
  position: fixed;
  bottom: 0%;
  width: 100%
}
 

</style>
