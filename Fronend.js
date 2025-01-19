src/
├── components/
│   ├── Home.js
│   ├── TokenGate.js
│   ├── Subscription.js
│   ├── CreatorDashboard.js
├── utils/
│   ├── ipfsClient.js
│   ├── blockchainHelpers.js
├── App.js
├── index.js
└── styles/
    └── index.css

// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import TokenGate from './components/TokenGate';
import Subscription from './components/Subscription';
import CreatorDashboard from './components/CreatorDashboard';

const App = () => (
  <Router>
    <div className="min-h-screen bg-gray-100">
      <header className="bg-purple-600 text-white p-4">
        <h1 className="text-center text-2xl">Token-Gated Content Platform</h1>
      </header>
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/token-gate" element={<TokenGate />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/creator-dashboard" element={<CreatorDashboard />} />
        </Routes>
      </main>
    </div>
  </Router>
);
export default App;

// Home.js
const Home = () => (
  <div className="text-center">
    <h2 className="text-xl">Welcome to the Token-Gated Content Platform</h2>
    <nav className="mt-4">
      <a href="/token-gate" className="text-purple-600 underline mx-2">Access Token-Gated Content</a>
      <a href="/subscription" className="text-purple-600 underline mx-2">Subscription Model</a>
      <a href="/creator-dashboard" className="text-purple-600 underline mx-2">Creator Dashboard</a>
    </nav>
  </div>
);
export default Home;

// TokenGate.js
import React, { useState } from 'react';
import { checkTokenOwnership } from '../utils/blockchainHelpers';

const TokenGate = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [tokenId, setTokenId] = useState('');

  const handleAccessCheck = async () => {
    const access = await checkTokenOwnership(tokenId);
    setHasAccess(access);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Token-Gated Access</h2>
      <input
        type="text"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        placeholder="Enter Token ID"
        className="w-full border rounded p-2 mb-4"
      />
      <button onClick={handleAccessCheck} className="bg-purple-600 text-white py-2 px-4 rounded">
        Check Access
      </button>
      {hasAccess ? (
        <p className="text-green-500 mt-4">Access Granted! You can view exclusive content.</p>
      ) : (
        <p className="text-red-500 mt-4">Access Denied! Invalid or no token ownership.</p>
      )}
    </div>
  );
};
export default TokenGate;

// Subscription.js
import React, { useState } from 'react';
import { ethers } from 'ethers';

const Subscription = () => {
  const [amount, setAmount] = useState('0.1');

  const subscribe = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const tx = await signer.sendTransaction({
      to: 'CREATOR_WALLET_ADDRESS',
      value: ethers.utils.parseEther(amount),
    });
    await tx.wait();
    alert('Subscription successful!');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Subscription Model</h2>
      <p className="mb-4">Subscribe to premium content for {amount} ETH.</p>
      <button onClick={subscribe} className="bg-purple-600 text-white py-2 px-4 rounded">
        Subscribe
      </button>
    </div>
  );
};
export default Subscription;

// CreatorDashboard.js
import React, { useState } from 'react';
import { ipfsClient } from '../utils/ipfsClient';

const CreatorDashboard = () => {
  const [file, setFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState('');

  const uploadContent = async (e) => {
    e.preventDefault();
    if (file) {
      const added = await ipfsClient.add(file);
      setIpfsHash(added.path);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Creator Dashboard</h2>
      <form onSubmit={uploadContent}>
        <div className="mb-4">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full" />
        </div>
        <button type="submit" className="bg-purple-600 text-white py-2 px-4 rounded">
          Upload to IPFS
        </button>
        {ipfsHash && <p className="text-green-500 mt-4">IPFS Hash: {ipfsHash}</p>}
      </form>
    </div>
  );
};
export default CreatorDashboard;

// blockchainHelpers.js
import { ethers } from 'ethers';

export const checkTokenOwnership = async (tokenId) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const address = await signer.getAddress();

  const contract = new ethers.Contract('TOKEN_CONTRACT_ADDRESS', TOKEN_CONTRACT_ABI, signer);
  const balance = await contract.balanceOf(address, tokenId);

  return balance.toNumber() > 0;
};

// ipfsClient.js
import { create } from 'ipfs-http-client';

export const ipfsClient = create({ url: 'https://ipfs.infura.io:5001/api/v0' });
