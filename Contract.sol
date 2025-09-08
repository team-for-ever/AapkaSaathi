// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    struct Item {
        uint id;
        string name;
        uint price;
        address payable seller;
        address owner;
        bool isListed;
    }

    uint public itemCount = 0;
    mapping(uint => Item) public items;
    mapping(address => uint[]) public ownedItems;

    // Marketplace fee in basis points (25 = 2.5%)
    uint public marketplaceFee = 25;
    address payable public marketplaceOwner;

    // Events
    event ItemListed(uint indexed id, string name, uint price, address indexed seller);
    event ItemPurchased(uint indexed id, address indexed buyer, uint price);
    event ItemTransferred(uint indexed id, address indexed from, address indexed to);
    event ItemDelisted(uint indexed id, address indexed seller);
    event ItemRelisted(uint indexed id, address indexed owner, uint newPrice);
    event MarketplaceFeeUpdated(uint oldFee, uint newFee);
    event MarketplaceOwnerUpdated(address oldOwner, address newOwner);
    event Withdrawal(uint amount, address to);

    // 🔹 Modifiers
    modifier onlyMarketplaceOwner() {
        require(msg.sender == marketplaceOwner, "Only marketplace owner");
        _;
    }

    modifier onlyItemOwner(uint _id) {
        require(_id > 0 && _id <= itemCount, "Item does not exist");
        require(msg.sender == items[_id].owner, "You do not own this item");
        _;
    }

    modifier onlySeller(uint _id) {
        require(_id > 0 && _id <= itemCount, "Item does not exist");
        require(msg.sender == items[_id].seller, "Only seller can perform this action");
        _;
    }

    constructor() {
        marketplaceOwner = payable(msg.sender);
    }

    // 🔹 List an item (free or priced)
    function listItem(string memory _name, uint _price) public {
        require(bytes(_name).length > 0, "Item name cannot be empty");

        itemCount++;
        items[itemCount] = Item(itemCount, _name, _price, payable(msg.sender), msg.sender, true);
        ownedItems[msg.sender].push(itemCount);

        emit ItemListed(itemCount, _name, _price, msg.sender);
    }

    // 🔹 Purchase an item
    function purchaseItem(uint _id) public payable nonReentrant {
        require(_id > 0 && _id <= itemCount, "Item does not exist");

        Item storage item = items[_id];
        require(item.isListed, "Item not available for sale");
        require(msg.sender != item.seller, "Seller cannot buy their own item");
        require(msg.value >= item.price, "Insufficient payment");

        // ✅ Effects before interaction
        item.isListed = false;
        address payable prevSeller = item.seller;

        _transferOwnership(_id, prevSeller, msg.sender);

        // Update seller to new owner for future resale
        item.seller = payable(msg.sender);

        // ✅ Handle payment
        if (item.price > 0) {
            uint fee = (item.price * marketplaceFee) / 1000;
            uint sellerAmount = item.price - fee;

            (bool sellerSuccess, ) = prevSeller.call{value: sellerAmount}("");
            require(sellerSuccess, "Payment to seller failed");

            if (fee > 0) {
                (bool feeSuccess, ) = marketplaceOwner.call{value: fee}("");
                require(feeSuccess, "Fee payment failed");
            }
        }

        // Refund excess ETH if buyer sent more than required
        if (msg.value > item.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - item.price}("");
            require(refundSuccess, "Refund failed");
        }

        emit ItemPurchased(_id, msg.sender, item.price);
    }

    // 🔹 Internal ownership transfer
    function _transferOwnership(uint _id, address _from, address _to) internal {
        require(_to != address(0), "Invalid recipient");

        Item storage item = items[_id];
        item.owner = _to;

        _removeItemFromOwner(_from, _id);
        ownedItems[_to].push(_id);

        emit ItemTransferred(_id, _from, _to);
    }

    // 🔹 Remove item from owner's list (gas optimized)
    function _removeItemFromOwner(address _owner, uint _itemId) internal {
        uint[] storage ownerItems = ownedItems[_owner];
        uint len = ownerItems.length;
        for (uint i = 0; i < len; i++) {
            if (ownerItems[i] == _itemId) {
                ownerItems[i] = ownerItems[len - 1];
                ownerItems.pop();
                break;
            }
        }
    }

    // 🔹 Relist item (resale)
    function relistItem(uint _id, uint _newPrice) public onlyItemOwner(_id) {
        Item storage item = items[_id];
        require(!item.isListed, "Item already listed");

        item.price = _newPrice;
        item.isListed = true;
        item.seller = payable(msg.sender);

        emit ItemRelisted(_id, msg.sender, _newPrice);
    }

    // 🔹 Public transfer (gift/trade)
    function transferItem(uint _id, address _to) public onlyItemOwner(_id) {
        require(_to != address(0), "Invalid recipient");
        _transferOwnership(_id, msg.sender, _to);
    }

    // 🔹 Get all item IDs owned by an address
    function getItemsByOwner(address _owner) public view returns (uint[] memory) {
        return ownedItems[_owner];
    }

    // 🔹 Get details of a specific item
    function getItem(uint _id) public view returns (
        uint, string memory, uint, address, address, bool
    ) {
        require(_id > 0 && _id <= itemCount, "Item does not exist");
        Item memory item = items[_id];
        return (item.id, item.name, item.price, item.seller, item.owner, item.isListed);
    }

    // 🔹 Lightweight summary (frontend-friendly)
    function getItemSummary(uint _id) public view returns (uint, uint, bool) {
        require(_id > 0 && _id <= itemCount, "Item does not exist");
        Item memory item = items[_id];
        return (item.id, item.price, item.isListed);
    }

    // 🔹 Pagination (instead of heavy getAllItems)
    function getItemsPaginated(uint start, uint limit) public view returns (Item[] memory) {
        require(start > 0 && start <= itemCount, "Invalid start");
        uint end = start + limit - 1;
        if (end > itemCount) {
            end = itemCount;
        }
        uint size = end - start + 1;

        Item[] memory pagedItems = new Item[](size);
        for (uint i = 0; i < size; i++) {
            pagedItems[i] = items[start + i];
        }
        return pagedItems;
    }

    // 🔹 Delist item
    function delistItem(uint _id) public onlySeller(_id) {
        Item storage item = items[_id];
        require(item.isListed, "Item not listed");

        item.isListed = false;
        emit ItemDelisted(_id, msg.sender);
    }

    // 🔹 Admin functions
    function updateMarketplaceFee(uint _newFee) public onlyMarketplaceOwner {
        require(_newFee <= 50, "Fee cannot exceed 5%"); 
        uint oldFee = marketplaceFee;
        marketplaceFee = _newFee;
        emit MarketplaceFeeUpdated(oldFee, _newFee);
    }

    function updateMarketplaceOwner(address payable _newOwner) public onlyMarketplaceOwner {
        require(_newOwner != address(0), "Invalid new owner");
        address oldOwner = marketplaceOwner;
        marketplaceOwner = _newOwner;
        emit MarketplaceOwnerUpdated(oldOwner, _newOwner);
    }

    // 🔹 ETH handling
    receive() external payable {
        // Accept ETH (donations or mistakes)
    }

    fallback() external payable {
        revert("Function does not exist");
    }

    // 🔹 Withdraw stuck ETH
    function withdraw() public onlyMarketplaceOwner {
        uint balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool success, ) = marketplaceOwner.call{value: balance}("");
        require(success, "Withdraw failed");
        emit Withdrawal(balance, marketplaceOwner);
    }
}
