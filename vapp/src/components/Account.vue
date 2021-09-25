<template>
  <div v-if="!disconnected && activeAccount != undefined">
    <span class="ButtonText">{{ displayAccount }}</span>
  </div>
  <div v-else-if="disconnected">
    <span class="ButtonText" @click="connectMetamask">CONNECT</span>
  </div>
  <div v-else>
    <span class="ButtonText">Change Newtork</span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Account',
  data() {
    return {
      disconnected: true
    }
  },
  computed: {
    ...mapGetters('accounts', ['activeAccount', 'activeBalance']),
    ...mapGetters('drizzle', ['drizzleInstance', 'isDrizzleInitialized']),
    displayAccount() {
      let account = this.activeAccount
      if (account == undefined) return undefined
      return account.slice(0, 4) + '...' + account.slice(-4)
    }
  },
  methods: {
    async connectMetamask() {
      let accounts = await this.MetaMask.request({ method: 'eth_requestAccounts' })
      this.handleAccountsChange(accounts)
    },
    handleAccountsChange(accounts) {
      if (accounts.length == 0) {
        this.disconnected = true
      } else {
        if (this.activeAccount == undefined) {
          this.Window.location.reload()
        }
        this.disconnected = false
      }
    }   
  },
  created: async function() {
    this.MetaMask.on('chainChanged', () => {
      this.Window.location.reload()
    })   
    let accounts = await this.MetaMask.request({ method: 'eth_requestAccounts' })
    this.handleAccountsChange(accounts)
    this.MetaMask.on('accountsChanged', this.handleAccountsChange)
  }
}
</script>

<style>
.ButtonText {
  font-weight: 900;
  font-size: 1rem;
}
</style>
