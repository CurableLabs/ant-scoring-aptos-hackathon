# Solidity Contracts - ANT Scoring System

## 📁 Directory Structure

```
solidity/
├── contracts/          ✅ PRODUCTION CONTRACTS
│   ├── ANTScoring.sol          ✅ Yours - Tested (13 tests passing)
│   ├── BondingCurve.sol        ✅ Yours - Ready for testing
│   ├── CleanDeploy.sol         ✅ Yours - Ready for testing
│   ├── BondingCurve2.sol       🔵 Team member's work
│   ├── CleanDeployReady.sol    🔵 Team member's work
│   └── CUREIntegration2.sol    🔵 Team member's work
│
├── src/                ⚠️ REFERENCE/ARCHIVE (older versions)
│   └── See src/README.md for details
│
├── test/               ✅ YOUR TEST SUITES
│   └── ANTScoring.t.sol        - 13 tests, 100% passing
│
└── foundry.toml        ⚙️ Config (points to contracts/ directory)
```

**⚠️ IMPORTANT**: Always use `contracts/` for active development. The `src/` folder contains reference copies only.

---

## ✅ Test Status

**ANTScoring Contract**: 13/13 tests passing ✅
- Fixed 3 critical arithmetic overflow bugs
- 100% function coverage
- Production-ready

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
