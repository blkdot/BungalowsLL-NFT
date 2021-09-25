<template>
<div class='NavBarWrapper'>
    <span class="edo gold title">LAZY LIONS</span>
    <button class="ConnectButton"><Account /></button>
</div>
</template>

<script>

import '../styles/globals.scss';
import Account from './Account';
export default {
    name: 'NavBar',
    components: {
      Account
    }
}
</script>

<style lang="scss">
.NavBarWrapper {
  background-color: #000;
  padding: 1rem 1.875rem;
  display: flex;
  justify-content: space-between;
}
.title {
  font-size: 2.25rem;
}
.ConnectButton {
  position: relative;
  overflow: hidden;
  padding: 1rem 1.875rem;

  @media (max-width: 768px) {
    padding: 0.5rem 0.875rem;
  }
  font-weight: 900;
  font-size: 1rem;
  border-radius: 999px;
  border: 0;
  color: #FFF;
  background-color: #5a5454;

  &:after {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    bottom: -50%;
    left: -50%;
    background: linear-gradient(to bottom, rgba(229, 172, 142, 0), rgba(255,255,255,0.5) 50%, rgba(229, 172, 142, 0));
    transform: rotateZ(60deg) translate(-10em, 17.5em);
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
    background-color: #5a5454;
  }

  &:focus{
    outline:0;
  }
}
</style>
