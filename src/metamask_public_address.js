import React from 'react'
import {Box} from '@sanity/ui'
import detectEthereumProvider from '@metamask/detect-provider';

class MetaMaskPublicAddress extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      metamask_installed: false,
      metamask_processing_connection: false,
      metamask_connected: false,
      metamask_address: ""
    }
    this.__handleMetaMaskAccounts = this.__handleMetaMaskAccounts.bind(this)
    this.__connect_to_metamask = this.__connect_to_metamask.bind(this)
  }

  async __checkMetamaskInstallation() {
    const provider = await detectEthereumProvider();

    if (provider) {
       this.setState({
        metamask_installed: true
       })

       this.__listenToMetaMaskEvents();
       this.__checkIfMetamaskConnected(provider)
    }   
  }


  async __connect_to_metamask() {
    this.setState({
      metamask_processing_connection: true
    })
    ethereum
      .request({ method: 'eth_requestAccounts' })
      .then((accounts)=>{
        this.setState({
          metamask_processing_connection: false,
          metamask_address: accounts[0]
        })
      })
      .catch((err) => {
        this.setState({
          metamask_processing_connection: false,
          metamask_connected: false
        })
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Please connect to MetaMask.');
          
        } else {
          console.error(err);
        }
      });
  }

  __handleMetaMaskAccounts(accounts) {
    if (accounts.length == 0) {
      this.setState({
        metamask_connected: false,
      })
    } else{
      this.setState({
        metamask_connected: true,
        metamask_address: accounts[0]
      })
    }
  }

  __getMetaMaskAccounts(cb) {
    this.setState({
      metamask_processing_connection: true
    })
    window.ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts)=>{
        this.setState({
          metamask_processing_connection: false
        })
        cb(accounts)
      })
      .catch((err) => {
        // Some unexpected error.
        // For backwards compatibility reasons, if no accounts are available,
        // eth_accounts will return an empty array.
        console.error(err);
        this.setState({
          metamask_processing_connection: false
        })
      });
  }


  async __checkIfMetamaskConnected(provider) {
    if (provider != window.ethereum) {
      console.error("Do you have multiple wallets installed?")
      return
    }

    this.__getMetaMaskAccounts((accounts)=>{
      this.__handleMetaMaskAccounts(accounts)
    })
    
  }

  __listenToMetaMaskEvents() {
    ethereum.on('accountsChanged', this.__handleMetaMaskAccounts);
    
    ethereum.on('chainChanged', (chainId) => {
      // Handle the new chain.
      // Correctly handling chain changes can be complicated.
      // We recommend reloading the page unless you have good reason not to.
      window.location.reload();
    });
  }

  componentDidMount() {
    if (window) {
      this.__checkMetamaskInstallation();
    }
  }

  componentWillUnmount() {
    if (window && window.ethereum) {
      ethereum.removeListener('accountsChanged', this.__handleMetaMaskAccounts);
    }
  }

  render() {
    return (
      <Box padding={4} paddingY={5}>
        <div>
          {
            (!this.state.metamask_installed) && (
              <div>
                <a href="https://metamask.io/download" target="__blank">Install MetaMask</a>
              </div>
            )
          }

          {
            (this.state.metamask_installed && 
              !this.state.metamask_connected && 
              !this.state.metamask_processing_connection) && (
              <div>
                <button onClick={this.__connect_to_metamask}>Connect to Metamask</button>
              </div>
            )
          }

          {
            (this.state.metamask_installed && 
              !this.state.metamask_connected && 
              this.state.metamask_processing_connection) && (
              <div>
                Connecting to metamask....
              </div>
            )
          }

          { 
            (this.state.metamask_installed && 
              this.state.metamask_connected && 
              this.state.metamask_address == "" &&
              this.state.metamask_processing_connection) && (
              <div>
                Getting account details....
              </div>
            )
          } 

          {
            (this.state.metamask_installed && 
              this.state.metamask_connected && 
              this.state.metamask_address != "") && (
                <div>This is metamask address {this.state.metamask_address}</div>
              )
          }
        </div>
      </Box>
    )
  }
}

export default MetaMaskPublicAddress
