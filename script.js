document.addEventListener("DOMContentLoaded", function () {
    let transactions = [];
    let net = {};
    let friends = [];

    
    document.getElementById("setFriends").addEventListener("click", function () {  //friend add krna
        const numFriends = parseInt(document.getElementById("numFriends").value);
        if (numFriends > 0) {
            
            friends = [];
            for (let i = 1; i <= numFriends; i++) {
                let friendName = prompt(`Enter the name of friend ${i}:`);
                if (friendName.trim()) {
                    friends.push(friendName.trim());
                    net[friendName] = 0; // Initialize their net balance to zero
                }
            }
            // Show the transaction section after friends are set
            document.getElementById("transactionSection").style.display = "block";
            document.getElementById("numFriends").disabled = true;
            document.getElementById("setFriends").disabled = true;
        } else {
            alert("Please enter a valid number of friends.");
        }
    });

    // Function to update balance display
    function updateBalances() {
        const balanceList = document.getElementById("balanceList");
        balanceList.innerHTML = ""; // Clear the balance list

        for (const person in net) {
            if (net[person] !== 0) {
                const li = document.createElement("li");
                li.textContent = `${person} is ${net[person] > 0 ? "owed" : "owes"} ${Math.abs(net[person])}`;
                balanceList.appendChild(li);
            }
        }
    }

    // Add a new transaction
    document.getElementById("addTransaction").addEventListener("click", function () {
        const from = document.getElementById("from").value.trim();
        const to = document.getElementById("to").value.trim();
        const amount = parseInt(document.getElementById("amount").value);

        if (from && amount && amount > 0) {
            if (!net[from]) net[from] = 0; // Initialize balance if not already present

            // Handle third-party payments (to non-friends)
            if (!to) {
                // Split the amount among all friends, excluding the payer
                let splitAmount = amount / friends.length;
                friends.forEach(friend => {
                    if (friend !== from) {
                        net[friend] += splitAmount; // Each friend is owed
                    }
                });
                net[from] -= amount; // The payer owes the total amount
            } else {
                // Normal transaction between friends
                if (!net[to]) net[to] = 0; // Initialize balance if not already present
                net[from] -= amount; // The person who paid owes this much
                net[to] += amount;   // The person who received is owed this much
            }

            // Update balances and clear inputs
            updateBalances();
            document.getElementById("from").value = "";
            document.getElementById("to").value = "";
            document.getElementById("amount").value = "";
        } else {
            alert("Please fill in all fields with valid data.");
        }
    });

    // Settle all expenses
    document.getElementById("settleExpenses").addEventListener("click", function () {
        const settlementList = document.getElementById("settlementList");
        settlementList.innerHTML = ""; // Clear previous settlements

        // Convert net object to array for sorting
        let balances = Object.keys(net).map(person => ({ person, balance: net[person] }));

        // Sort balances: people who owe (negative balances) vs people who are owed (positive balances)
        balances.sort((a, b) => a.balance - b.balance);

        let i = 0;               // Start with the person who owes the most (negative balance)
        let j = balances.length - 1;  // Start with the person who is owed the most (positive balance)
        let count = 0;           // To keep track of how many settlements are made

        while (i < j) {
            let debitPerson = balances[i].person;
            let creditPerson = balances[j].person;
            let debit = balances[i].balance;   // Negative amount (owed by this person)
            let credit = balances[j].balance;  // Positive amount (owed to this person)

            // Calculate how much can be settled between the two
            let settledAmount = Math.min(-debit, credit);  // Settles the minimum of the debt and credit

            // Log settlement transaction
            if (settledAmount > 0) {
                const settlementMsg = `${debitPerson} will pay ${settledAmount} to ${creditPerson}`;
                const settlementItem = document.createElement("li");
                settlementItem.textContent = settlementMsg;
                settlementList.appendChild(settlementItem);

                // Update the balances
                balances[i].balance += settledAmount;  // Increase the debtor's balance (reduce their debt)
                balances[j].balance -= settledAmount;  // Reduce the creditor's balance (reduce what they're owed)
                count++;
            }

            // If the debtor's balance is settled (zero), move to the next debtor
            if (balances[i].balance === 0) i++;

            // If the creditor's balance is settled (zero), move to the next creditor
            if (balances[j].balance === 0) j--;
        }

        // If no settlements were made (all balances are already zero)
        if (count === 0) {
            const noSettlementItem = document.createElement("li");
            noSettlementItem.textContent = "All expenses are already settled.";
            settlementList.appendChild(noSettlementItem);
        }
    });
});
