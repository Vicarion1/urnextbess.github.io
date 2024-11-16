document.addEventListener('DOMContentLoaded', () => {
  const deviceSelect = document.getElementById('deviceSelect');
  const deviceContainers = {
    sel751Iframe1: document.getElementById('device1Container'),
    sel751Iframe2: document.getElementById('device2Container'),
    sel751Iframe3: document.getElementById('device3Container'),
  };

  deviceSelect.addEventListener('change', async (event) => {
    const selectedDevice = event.target.value;

    // Hide all device containers
    Object.values(deviceContainers).forEach(container => {
      container.style.display = 'none';
    });

    // Show the selected device container
    deviceContainers[selectedDevice].style.display = 'block';
    await checkAndLoadIframe(selectedDevice);
  });

  // Set initial visibility and check the initial iframe
  deviceContainers['sel751Iframe1'].style.display = 'block';
  checkAndLoadIframe('sel751Iframe1');

  const reconnectBtn = document.getElementById('reconnectBtn');
  reconnectBtn.addEventListener('click', async () => {
    const selectedDevice = deviceSelect.value;
    const clientName = selectedDevice.replace('sel751Iframe', 'client');
    await reconnectVPN(clientName);
    await checkAndLoadIframe(selectedDevice);
  });

  // Function to reconnect VPN
  async function reconnectVPN(clientName) {
    try {
      const response = await fetch(`http://ec2-3-19-230-94.us-east-2.compute.amazonaws.com/reconnect-vpn/${clientName}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Failed to reconnect VPN for ${clientName}. Status: ${response.status}`);
      }

      console.log(`VPN for ${clientName} reconnected successfully.`);
    } catch (error) {
      console.error(`Error reconnecting VPN (${clientName}):`, error);
      alert(`Error reconnecting VPN for ${clientName}. Please try again.`);
    }
  }

  // Function to check VPN connection and load iframe if available
  async function checkAndLoadIframe(selectedDevice) {
    const deviceId = selectedDevice.replace('sel751Iframe', '');
    const loadingElement = document.getElementById(`loading${deviceId}`);
    const iframe = document.getElementById(selectedDevice);

    // Show loading message
    loadingElement.style.display = 'block';
    loadingElement.textContent = 'Loading...';
    iframe.style.visibility = 'hidden';

    try {
      // Make a request to check the VPN connection and device status
      const response = await fetch(`http://ec2-3-19-230-94.us-east-2.compute.amazonaws.com/device/${deviceId}`);

      if (!response.ok) {
        if (response.status === 502) {
          // If VPN is connected but the device itself is unreachable
          throw new Error('VPN connected but the device is unreachable. Please check the device status.');
        } else if (response.status === 404) {
          // Device not found
          throw new Error('Device not found.');
        } else {
          // Unexpected error
          throw new Error(`Unexpected error: ${response.status}`);
        }
      }

      // If VPN is active and device is reachable, load the iframe
      loadingElement.style.display = 'none';
      iframe.style.visibility = 'visible';
    } catch (error) {
      console.error(`Error loading device ${deviceId}:`, error);
      loadingElement.textContent = `Error: ${error.message}. Please try reconnecting.`;
    }
  }
});