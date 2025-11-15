# Solidity Contracts - ANT Scoring System

## 📁 Directory Structure

```
solidity/
├── contracts/                   Production Contracts
│   ├── ANTScoring.sol          - Proposal scoring (13 tests passing)
│   ├── BondingCurve.sol        - Token bonding curve
│   └── CleanDeploy.sol         - Tri-lane system
│
├── src/                         Additional Contracts
│   ├── BondingCurve2.sol       - Alternative bonding curve
│   ├── CleanDeployReady.sol    - Advanced tri-lane
│   └── CUREIntegration2.sol    - CURE integration
│
├── test/
│   ├── foundry/                 Foundry Tests
│   │   └── ANTScoring.t.sol    - 13 tests passing
│   └── hardhat/                 Hardhat Tests
│       └── CleanDeployReady.test.js
│
└── foundry.toml                 Foundry config
```

---

## ✅ Test Status

**ANTScoring Contract**: 13/13 tests passing
- Comprehensive Foundry test suite
- 100% function coverage
- All arithmetic overflow bugs fixed

---

## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
