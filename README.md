# Poneglyph

Toy project to learn how to use the Solana Anchor framework.
- https://www.anchor-lang.com/docs/installation
- https://solana.com/docs/programs/anchor/cpi

## Project Design (Ticket seller)

### Current Issues with Ticket Selling

- Scalping: Tickets are bought in bulk and resold at a higher price.
- Fraud: Fake tickets are sold to unsuspecting customers.
- Scalability: Ticket sales are limited to the capacity of the venue. (?)
- Centralization: Ticket sales are controlled by a single entity.
- Network Congestion: High demand for tickets can cause network congestion. (?)

### Solution

- Create a decentralized ticket selling platform.
- Tickets are sold as NFTs.
- Tickets are minted by the organizer and sold to customers.
- Tickets can be resold by customers and the organizer receives a commission.
- Tickets can be verified by the organizer and the customer.
- Tickets can be redeemed by the customer at the venue.

### Components

- Organizer: Mints tickets and receives commissions.
- Customer: Buys tickets and resells tickets.
- Venue: Verifies tickets and redeems tickets.

### Flow

```mermaid
graph TD
    A[Organizer] -->|Mint| B((Ticket))
    B -->|Sell| C[Customer]
    C -->|Resell| D[Customer]
    D -->|Sell| E[Customer]
    E -->|Redeem| F[Venue]
```

```mermaid
sequenceDiagram

actor Organizer
participant organizer-hardware
participant server-APIs
participant Solana-contract
participant Solana-network
participant client-app
actor Customer

Organizer ->> server-APIs: Mint tickets request <br>ticket info: {number, price, date, venue, restrictions}
server-APIs ->> Solana-contract: Mint ticket request
Solana-contract ->> Solana-contract: Mint ticket
Solana-contract ->> Solana-network: SolAccount creation
Solana-network ->> Solana-contract: SolAccount creation response
Solana-contract ->> server-APIs: Mint ticket response <br>server can now sell tickets
server-APIs ->> client-app: Ticket sale
Customer ->> client-app: Buy ticket
client-app ->> server-APIs: Ticket sale request
server-APIs ->> Solana-contract: Transfer ticket request
Solana-contract ->> Solana-contract: Transfer ticket
Solana-contract ->> Solana-network: SolAccount update
Solana-network ->> Solana-contract: SolAccount update response
Solana-contract ->> server-APIs: Transfer ticket response
server-APIs ->> client-app: Ticket sale response
client-app ->> client-app: Ticket secured by client-app dynamically <br>(maybe using a 3-rd party service like Apple verify)
Customer ->> client-app: Resell ticket
client-app ->> server-APIs: Ticket resell request
server-APIs ->> Solana-contract: Transfer ticket request
Solana-contract ->> Solana-contract: Transfer ticket
Solana-contract ->> Solana-network: SolAccount update
Solana-network ->> Solana-contract: SolAccount update response
Solana-contract ->> server-APIs: Transfer ticket response
server-APIs ->> client-app: Ticket resell response
client-app ->> client-app: Ticket secured by client-app dynamically <br>(maybe using a 3-rd party service like Apple verify)
Customer ->> client-app: Use ticket
client-app ->> server-APIs: Ticket use request
server-APIs ->> Solana-contract: Redeem ticket request
Solana-contract ->> Solana-contract: Redeem ticket
Solana-contract ->> Solana-network: SolAccount update
Solana-network ->> Solana-contract: SolAccount update response
Solana-contract ->> server-APIs: Redeem ticket response
server-APIs ->> client-app: Ticket use response
client-app ->> organizer-hardware: Ticket verification
organizer-hardware ->> server-APIs: Ticket verification request
server-APIs ->> Solana-contract: Verify ticket request
Solana-contract ->> Solana-contract: Verify ticket
Solana-contract ->> Solana-network: SolAccount update
Solana-network ->> Solana-contract: SolAccount update response
Solana-contract ->> server-APIs: Verify ticket response
server-APIs ->> organizer-hardware: Ticket verification response
```

### MVP

- Organizer can mint tickets and sell tickets by setting the ticket price.
- Customer can buy tickets and resell tickets limited to the ticket price.
- Venue can verify tickets and redeem tickets.

### Future Features

- Organizer can set restrictions on tickets.
- Customer can buy tickets in bulk.
- Customer can resell tickets at a higher price. (?)

## Setup

The rust toolchain is required to build the project. The following commands will install the rust toolchain and the required dependencies.

```bash
# Install the rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Installing using Anchor version manager
```bash
# Install the Anchor version manager
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install the build dependencies
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Check the version of Anchor
solana --version

# Install the latest version of Anchor
avm install latest

# Check the version of Anchor
anchor --version

# Initialize a new project
anchor init [new-workspace-name]
```

## Build

```bash
# Build the project
anchor build
```

## Test

```bash
# Run the tests
anchor test
```

- https://solana.com/docs/programs/deploying

## Learnings

### Rent Exemption

![solana structure](./docs/sol-structure.png)

- https://stackoverflow.com/questions/68915470/solana-rent-exemption
- https://www.helius.dev/blog/solana-executive-overview

Rent is a mechanism designed to incentivize users to close accounts and reduce state bloat. To create a new account, a minimum balance of SOL, known as the "rent-exempt" amount, must be held by the account. This can be considered a storage cost incurred to keep the account alive in a validator's memory. If the size of the account's data increases, the minimum balance rent requirement increases proportionally. When an account is no longer needed, it can be closed, and the rent is returned to the account owner.
