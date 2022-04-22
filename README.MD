# Backend for p2p payments application

This is the server for the core service of the p2p payments application.

## Product core stack

Core stack of this project is **NodeJs**, **Expressl**, **MongoDB**, **TypeScript**

## Setup

Make sure on your local machine you have Nodejs installed. Clone the repository, then in the root project directory run **yarn** to install all dependencies, After installation create a **.env**(Environment Variables) file in the project root directory. Then check the **.env.example** file to see how the structure of the keys in the **.env** should look like.

## Start Server

When done with setup in your project root folder, simply run the command **yarn dev** to start the sever in development.

### Improvements

- On signup a virtual account can be created for the user as another means of funding, Currently only card funding is available
- Code structure can be further decoupled to have queries that interact with the database as a seperate service(Repository Pattern)
- Add Withdrawals to bank account
- Add withdrawal PIN and validate pin before p2p transactions or withdrawals
