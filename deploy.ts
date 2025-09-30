#!/usr/bin/env ts-node

import { Aptos, AptosConfig, Network, Account } from "@aptos-labs/ts-sdk";
import * as fs from "fs";
import * as path from "path";

// Configuration
const NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com/v1";
const FAUCET_URL = process.env.APTOS_FAUCET_URL || "https://faucet.devnet.aptoslabs.com";

// CurableDAO address (replace with actual address)
const CURABLE_DAO_ADDRESS = process.env.CURABLE_DAO_ADDRESS || "0x1"; // Default to 0x1 for demo

interface DeploymentConfig {
    network: string;
    nodeUrl: string;
    faucetUrl?: string;
    curableDAOAddress: string;
    deployer?: string;
}

interface DeploymentResult {
    success: boolean;
    moduleAddress: string;
    transactionHash: string;
    deployerAddress: string;
    timestamp: string;
    network: string;
}

/**
 * ANT Scoring System Deployer for Aptos
 */
class ANTScoringDeployer {
    private client: AptosClient;
    private account: AptosAccount;
    private config: DeploymentConfig;

    constructor(config: DeploymentConfig, privateKey?: string) {
        this.client = new AptosClient(config.nodeUrl);
        this.config = config;
        
        if (privateKey) {
            // Use provided private key
            this.account = new AptosAccount(HexString.ensure(privateKey).toUint8Array());
        } else {
            // Generate new account
            this.account = new AptosAccount();
        }
    }

    /**
     * Fund the deployer account (devnet/testnet only)
     */
    async fundAccount(amount: number = 100_000_000): Promise<void> {
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
            
            console.log(`✅ Account funded! Balance: ${balance / 100_000_000} APT`);
        } catch (error) {
            console.error("❌ Failed to fund account:", error);
            throw error;
        }
    }

    /**
     * Compile and deploy the ANT scoring module
     */
    async deploy(): Promise<DeploymentResult> {
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
            console.log(`   Balance: ${balance / 100_000_000} APT`);

            if (balance < 1_000_000) { // Less than 0.01 APT
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
            const payload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
                TxnBuilderTypes.EntryFunction.natural(
                    "0x1::code",
                    "publish_package_txn",
                    [],
                    [
                        TxnBuilderTypes.TransactionArgument.new_u8_vector(new TextEncoder().encode("ant_scoring")),
                        TxnBuilderTypes.TransactionArgument.new_u8_vector(moduleHex)
                    ]
                )
            );

            const txnRequest = await this.client.generateTransaction(
                this.account.address(),
                payload,
                { 
                    max_gas_amount: "200000",
                    gas_unit_price: "100"
                }
            );

            const signedTxn = await this.client.signTransaction(this.account, txnRequest);
            const txnResult = await this.client.submitTransaction(signedTxn);

            console.log(`📋 Transaction submitted: ${txnResult.hash}`);
            console.log("⏳ Waiting for transaction confirmation...");

            await this.client.waitForTransaction(txnResult.hash);

            // Initialize the ANT scoring system
            console.log("🔧 Initializing ANT Scoring System...");
            await this.initializeSystem();

            const result: DeploymentResult = {
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

        } catch (error) {
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
    private async initializeSystem(): Promise<void> {
        const payload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
            TxnBuilderTypes.EntryFunction.natural(
                `${this.account.address()}::ant_scoring`,
                "initialize",
                [],
                [
                    TxnBuilderTypes.TransactionArgument.new_address(
                        TxnBuilderTypes.AccountAddress.fromHex(this.config.curableDAOAddress)
                    )
                ]
            )
        );

        const txnRequest = await this.client.generateTransaction(
            this.account.address(),
            payload
        );

        const signedTxn = await this.client.signTransaction(this.account, txnRequest);
        const txnResult = await this.client.submitTransaction(signedTxn);

        await this.client.waitForTransaction(txnResult.hash);
        console.log(`✅ ANT System initialized! Tx: ${txnResult.hash}`);
    }

    /**
     * Compile Move module (placeholder - in practice use aptos CLI)
     */
    private async compileModule(): Promise<Uint8Array> {
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
    private async saveDeploymentInfo(result: DeploymentResult): Promise<void> {
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
        let config: DeploymentConfig;
        
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

        } else {
            console.log("\n❌ Deployment Failed!");
            process.exit(1);
        }

    } catch (error) {
        console.error("💥 Fatal error:", error);
        process.exit(1);
    }
}

// Export for use as module
export { ANTScoringDeployer, DeploymentConfig, DeploymentResult };

// Run if called directly
if (require.main === module) {
    main();
}
