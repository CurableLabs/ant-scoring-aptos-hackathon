#!/usr/bin/env ts-node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANTScoringDeployer = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Configuration
const NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com/v1";
const FAUCET_URL = process.env.APTOS_FAUCET_URL || "https://faucet.devnet.aptoslabs.com";
// CurableDAO address (replace with actual address)
const CURABLE_DAO_ADDRESS = process.env.CURABLE_DAO_ADDRESS || "0x1"; // Default to 0x1 for demo
/**
 * ANT Scoring System Deployer for Aptos
 */
class ANTScoringDeployer {
    constructor(config, privateKey) {
        this.client = new AptosClient(config.nodeUrl);
        this.config = config;
        if (privateKey) {
            // Use provided private key
            this.account = new AptosAccount(HexString.ensure(privateKey).toUint8Array());
        }
        else {
            // Generate new account
            this.account = new AptosAccount();
        }
    }
    /**
     * Fund the deployer account (devnet/testnet only)
     */
    async fundAccount(amount = 100000000) {
        if (!this.config.faucetUrl) {
            console.log("⚠️  No faucet URL provided, skipping funding...");
            return;
        }
        console.log("💰 Funding deployer account...");
        console.log(`   Address: ${this.account.address()}`);
        try {
            const faucetClient = new AptosClient(this.config.faucetUrl);
            await faucetClient.fundAccount(this.account.address(), amount);
            // Wait for funding to complete
            await new Promise(resolve => setTimeout(resolve, 2000));
            const balance = await this.client.getAccountCoinAmount({
                accountAddress: this.account.address(),
                coinType: "0x1::aptos_coin::AptosCoin"
            });
            console.log(`✅ Account funded! Balance: ${balance / 100000000} APT`);
        }
        catch (error) {
            console.error("❌ Failed to fund account:", error);
            throw error;
        }
    }
    /**
     * Compile and deploy the ANT scoring module
     */
    async deploy() {
        try {
            console.log("🚀 Deploying ANT Scoring System to Aptos...");
            console.log(`   Network: ${this.config.network}`);
            console.log(`   Node URL: ${this.config.nodeUrl}`);
            console.log(`   Deployer: ${this.account.address()}`);
            // Check account balance
            const balance = await this.client.getAccountCoinAmount({
                accountAddress: this.account.address(),
                coinType: "0x1::aptos_coin::AptosCoin"
            });
            console.log(`   Balance: ${balance / 100000000} APT`);
            if (balance < 1000000) { // Less than 0.01 APT
                throw new Error("Insufficient balance for deployment. Please fund your account.");
            }
            // Read and compile the Move module
            const moveFilePath = path.join(__dirname, "sources", "ant_scoring.move");
            if (!fs.existsSync(moveFilePath)) {
                throw new Error(`Move file not found at ${moveFilePath}`);
            }
            console.log("📦 Compiling Move module...");
            // For this example, we'll use the bytecode placeholder
            // In practice, you would compile the module using aptos CLI
            const moduleHex = await this.compileModule();
            console.log("📤 Publishing module to blockchain...");
            // Create publish package transaction
            const payload = new TxnBuilderTypes.TransactionPayloadEntryFunction(TxnBuilderTypes.EntryFunction.natural("0x1::code", "publish_package_txn", [], [
                TxnBuilderTypes.TransactionArgument.new_u8_vector(new TextEncoder().encode("ant_scoring")),
                TxnBuilderTypes.TransactionArgument.new_u8_vector(moduleHex)
            ]));
            const txnRequest = await this.client.generateTransaction(this.account.address(), payload, {
                max_gas_amount: "200000",
                gas_unit_price: "100"
            });
            const signedTxn = await this.client.signTransaction(this.account, txnRequest);
            const txnResult = await this.client.submitTransaction(signedTxn);
            console.log(`📋 Transaction submitted: ${txnResult.hash}`);
            console.log("⏳ Waiting for transaction confirmation...");
            await this.client.waitForTransaction(txnResult.hash);
            // Initialize the ANT scoring system
            console.log("🔧 Initializing ANT Scoring System...");
            await this.initializeSystem();
            const result = {
                success: true,
                moduleAddress: this.account.address().hex(),
                transactionHash: txnResult.hash,
                deployerAddress: this.account.address().hex(),
                timestamp: new Date().toISOString(),
                network: this.config.network
            };
            console.log("✅ Deployment successful!");
            console.log(`   Module Address: ${result.moduleAddress}`);
            console.log(`   Transaction: ${result.transactionHash}`);
            // Save deployment info
            await this.saveDeploymentInfo(result);
            return result;
        }
        catch (error) {
            console.error("❌ Deployment failed:", error);
            return {
                success: false,
                moduleAddress: "",
                transactionHash: "",
                deployerAddress: this.account.address().hex(),
                timestamp: new Date().toISOString(),
                network: this.config.network
            };
        }
    }
    /**
     * Initialize the ANT scoring system after deployment
     */
    async initializeSystem() {
        const payload = new TxnBuilderTypes.TransactionPayloadEntryFunction(TxnBuilderTypes.EntryFunction.natural(`${this.account.address()}::ant_scoring`, "initialize", [], [
            TxnBuilderTypes.TransactionArgument.new_address(TxnBuilderTypes.AccountAddress.fromHex(this.config.curableDAOAddress))
        ]));
        const txnRequest = await this.client.generateTransaction(this.account.address(), payload);
        const signedTxn = await this.client.signTransaction(this.account, txnRequest);
        const txnResult = await this.client.submitTransaction(signedTxn);
        await this.client.waitForTransaction(txnResult.hash);
        console.log(`✅ ANT System initialized! Tx: ${txnResult.hash}`);
    }
    /**
     * Compile Move module (placeholder - in practice use aptos CLI)
     */
    async compileModule() {
        // This is a placeholder. In practice, you would:
        // 1. Use the Aptos CLI to compile: `aptos move compile`
        // 2. Read the compiled bytecode from build/ant_scoring/bytecode_modules/
        // 3. Return the bytecode as Uint8Array
        console.log("⚠️  Using placeholder bytecode - compile using 'aptos move compile' in practice");
        // Return empty bytecode for now
        return new Uint8Array([]);
    }
    /**
     * Save deployment information to file
     */
    async saveDeploymentInfo(result) {
        const deploymentInfo = {
            ...result,
            config: this.config,
            abi: {
                // Add ABI information here for frontend integration
                address: result.moduleAddress,
                name: "ant_scoring",
                functions: [
                    "initialize",
                    "submit_proposal",
                    "score_proposal",
                    "fulfill_proposal",
                    "authorize_scorer",
                    "revoke_scorer"
                ],
                views: [
                    "get_proposal",
                    "get_active_proposals",
                    "get_passing_proposals",
                    "is_authorized_scorer",
                    "get_proposal_count"
                ]
            }
        };
        const filePath = path.join(__dirname, "deployment-info.json");
        fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
        console.log(`📄 Deployment info saved to: ${filePath}`);
    }
    /**
     * Get account information
     */
    getAccountInfo() {
        return {
            address: this.account.address().hex(),
            publicKey: this.account.pubKey().hex(),
            privateKey: this.account.signingKey.secretKey
        };
    }
}
exports.ANTScoringDeployer = ANTScoringDeployer;
/**
 * Main deployment function
 */
async function main() {
    try {
        console.log("🔧 ANT Scoring System - Aptos Deployment");
        console.log("==========================================\n");
        // Parse command line arguments
        const args = process.argv.slice(2);
        const network = args[0] || "devnet";
        const privateKey = process.env.PRIVATE_KEY;
        // Configure deployment based on network
        let config;
        switch (network) {
            case "devnet":
                config = {
                    network: "devnet",
                    nodeUrl: "https://fullnode.devnet.aptoslabs.com/v1",
                    faucetUrl: "https://faucet.devnet.aptoslabs.com",
                    curableDAOAddress: CURABLE_DAO_ADDRESS
                };
                break;
            case "testnet":
                config = {
                    network: "testnet",
                    nodeUrl: "https://fullnode.testnet.aptoslabs.com/v1",
                    faucetUrl: "https://faucet.testnet.aptoslabs.com",
                    curableDAOAddress: CURABLE_DAO_ADDRESS
                };
                break;
            case "mainnet":
                config = {
                    network: "mainnet",
                    nodeUrl: "https://fullnode.mainnet.aptoslabs.com/v1",
                    curableDAOAddress: CURABLE_DAO_ADDRESS
                };
                break;
            default:
                throw new Error(`Unknown network: ${network}`);
        }
        // Create deployer
        const deployer = new ANTScoringDeployer(config, privateKey);
        // Display account info
        const accountInfo = deployer.getAccountInfo();
        console.log(`🔑 Deployer Account: ${accountInfo.address}`);
        if (!privateKey) {
            console.log(`🆕 Generated new account - save this private key:`);
            console.log(`   Private Key: ${Buffer.from(accountInfo.privateKey).toString('hex')}`);
        }
        // Fund account if on devnet/testnet
        if (config.faucetUrl) {
            await deployer.fundAccount();
        }
        // Deploy the contract
        const result = await deployer.deploy();
        if (result.success) {
            console.log("\n🎉 Deployment Complete!");
            console.log("========================");
            console.log(`Network: ${result.network}`);
            console.log(`Module Address: ${result.moduleAddress}`);
            console.log(`Transaction Hash: ${result.transactionHash}`);
            console.log(`Timestamp: ${result.timestamp}`);
            console.log("\n🔗 Next Steps:");
            console.log("1. Update your frontend to use the deployed module address");
            console.log("2. Authorize additional scorers using the authorize_scorer function");
            console.log("3. Start submitting and scoring proposals!");
            console.log("\n📖 Documentation:");
            console.log("- View functions: get_proposal, get_active_proposals, get_passing_proposals");
            console.log("- Entry functions: submit_proposal, score_proposal, fulfill_proposal");
            console.log("- Admin functions: authorize_scorer, revoke_scorer");
        }
        else {
            console.log("\n❌ Deployment Failed!");
            process.exit(1);
        }
    }
    catch (error) {
        console.error("💥 Fatal error:", error);
        process.exit(1);
    }
}
// Run if called directly
if (require.main === module) {
    main();
}
