# Wallet Integration Guide

## Overview

The **WalletButton** component provides full wallet connection functionality for SettleSync, enabling users to connect their Pi Network wallet and view their connection status before executing settlements.

## Features

### Connection Management
- Displays real-time wallet connection status
- Shows "Connecting..." during initial SDK initialization
- Displays connected wallet information once authenticated
- Provides dropdown menu with detailed wallet information

### Wallet Display
- Shortened wallet address (first 6 + last 4 characters)
- Username fallback if available
- Session identifier if no wallet address stored
- Copy-to-clipboard functionality for wallet address

### Status Indicators
- Visual green indicator showing "Connected" status
- Color-coded button states (primary color when connected, muted when connecting)
- Clear status message in dropdown menu

### Network Information
- Displays current network (Pi Network)
- Shows confirmation that user is on correct blockchain network

### Interaction Features
- Click to open/close dropdown menu
- Copy button to copy wallet address to clipboard
- Verify Connection button to recheck wallet status
- Close button to dismiss dropdown
- Outside click dismisses dropdown
- Responsive design (full text on desktop, abbreviated on mobile)

## Component Structure

```
WalletButton
├── Connected State
│   ├── Primary button with wallet icon
│   ├── Shortened address/username display
│   └── Dropdown menu with:
│       ├── Status indicator
│       ├── Full wallet address with copy button
│       ├── Network information
│       ├── Verify Connection button
│       └── Close button
└── Connecting State
    ├── Muted disabled button
    ├── Lock icon
    └── "Connecting..." text (desktop only)
```

## Usage

### Basic Implementation
```tsx
import { WalletButton } from '@/components/wallet-button';

// Add to your header or navigation
<WalletButton />
```

### Within SettleSync
The WalletButton is integrated into all three main screens:

1. **Settlement Initiator** - Data Entry screen
   - Located in top-right corner of header
   - Allows users to verify wallet before entering settlement details

2. **Transaction Review** - Review screen
   - Located in top-right corner after back button
   - Confirms wallet connection before execution

3. **Settlement Receipt** - Receipt screen
   - Located in top-right corner
   - Displays successful connection after transaction

## Technical Details

### Props
The component accepts no required props - it manages its own state through the Pi Auth Context.

### Dependencies
- `usePiAuth()` - Pi Network authentication context hook
- `SDK` instance for wallet information retrieval

### State Management
- `walletAddress` - Current connected wallet address
- `isOpen` - Dropdown menu visibility state
- `isLoading` - Verification process loading state

### API Calls
- `sdk.state.get('user_profile')` - Retrieves stored user profile with wallet address
- Fallback to session-based identifier if not stored

## Styling

### Design System
- Uses semantic design tokens from globals.css
- Responsive breakpoints for mobile/desktop
- Tailwind CSS for styling
- Dark mode compatible

### Color Scheme
- **Primary**: Button background when connected
- **Muted**: Button state when connecting
- **Green**: Connection status indicator
- **Card**: Dropdown menu background
- **Border**: Subtle borders for visual separation

### Responsiveness
- Desktop: Full wallet address display, complete labels
- Mobile: Abbreviated "Wallet" text, responsive spacing
- Dropdown: Positioned absolutely to stay visible
- Touch-friendly: Large tap targets (44px minimum)

## Connection Flow

### User Journey
1. User loads SettleSync app
2. Pi SDK initializes automatically (handled by AppWrapper)
3. WalletButton shows "Connecting..." while SDK initializes
4. Once authenticated, WalletButton displays wallet information
5. User can click to open dropdown and see full details
6. User can verify connection or copy wallet address
7. User proceeds with settlement knowing wallet is connected

### Error Handling
- Graceful fallback to "Connected" text if wallet address unavailable
- Session-based identifier fallback (π + random string)
- Error logging on failed wallet fetch attempts
- Disabled state during connecting phase

## Integration with Settlement Flow

### Pre-Execution Check
When user proceeds to execute a settlement:
1. Wallet connection is already verified (shown in button)
2. User can confirm connection is active via dropdown
3. SDK is ready for transaction processing
4. No additional connection steps needed during settlement

### Transaction Preparation
- Wallet address can be used for transaction verification
- Connection status ensures SDK is properly initialized
- Ready for Pi Network payment processing

## Future Enhancements

- Display wallet balance (if available from Pi SDK)
- Multi-wallet support (if Pi Network supports)
- Transaction history from wallet
- Network switching capability
- Advanced wallet options menu
- Wallet disconnect functionality
- Connection timeout handling

## Accessibility

- Semantic HTML with proper button elements
- ARIA labels for icon-only buttons
- Keyboard navigation support
- Color-independent status indicators (icon + text)
- Sufficient color contrast ratios
- Touch-friendly interface sizing

## Browser Support

- Works in all modern browsers supporting ES6+
- Requires Pi SDK availability
- Mobile optimized for touch interaction
- Responsive design works on all viewport sizes

## Troubleshooting

### Wallet Button Shows "Connecting..."
- **Cause**: Pi SDK is still initializing
- **Solution**: Wait for SDK to complete initialization (typically 2-3 seconds)
- **Fallback**: Check browser console for any SDK loading errors

### Wallet Address Not Displaying
- **Cause**: User profile not yet stored in Pi SDK
- **Solution**: Check that Pi SDK login completed successfully
- **Fallback**: Session identifier is displayed instead

### Copy to Clipboard Not Working
- **Cause**: Browser doesn't support Clipboard API or user denied permission
- **Solution**: Check browser console for errors, ensure HTTPS connection
- **Fallback**: User can manually copy from the displayed address

### Dropdown Menu Not Closing
- **Cause**: Click event not properly detected
- **Solution**: Click anywhere outside dropdown to close
- **Fallback**: Refresh page to reset component state
