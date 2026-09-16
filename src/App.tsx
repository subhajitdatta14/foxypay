import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MachineScreenState,
  OrderDetails,
  TerminalMode,
  PaymentMethod,
} from './types';
import { CheckoutMachine } from './components/CheckoutMachine';
import { ReceiptDetailsModal } from './components/ReceiptDetailsModal';
import { sound } from './utils/sound';

export default function App() {
  // Machine Power State (Always starts OFF on initial load/refresh, never persisted)
  const [isPoweredOn, setIsPoweredOn] = useState<boolean>(false);
  const [screenState, setScreenState] = useState<MachineScreenState>('OFF');

  // Payment method & Input State (starts completely empty, never persisted)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [rawInput, setRawInput] = useState<string>('');
  const [pin, setPin] = useState<string>('');

  // Easter Eggs & Terminal Modes
  const [terminalMode, setTerminalMode] = useState<TerminalMode>('NORMAL');
  const [retroPhase, setRetroPhase] = useState<'BOOT1' | 'BOOT2' | 'READY'>('READY');
  const clearPressCountRef = useRef<number>(0);
  const retroEnterPressCountRef = useRef<number>(0);
  const keypadBufferRef = useRef<string>('');

  // Receipt Modal Open State & Paper Tear State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isTearing, setIsTearing] = useState<boolean>(false);
  const [isReceiptTorn, setIsReceiptTorn] = useState<boolean>(false);

  useEffect(() => {
    if (
      screenState === 'OFF' ||
      screenState === 'BOOTING' ||
      screenState === 'WELCOME' ||
      screenState === 'IDLE_CHOOSE_METHOD' ||
      screenState === 'AWAITING_CARD_TAP' ||
      screenState === 'AWAITING_UPI_SCAN'
    ) {
      setIsReceiptTorn(false);
      setIsTearing(false);
    }
  }, [screenState]);

  // Order Details Generator
  const generateOrderDetails = useCallback((amt: number, method: PaymentMethod): OrderDetails => {
    const now = new Date();
    const dateFormatted = now
      .toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
      .toUpperCase();

    const timeFormatted = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const txnId = `TXN-${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${randomSuffix}`;
    const orderNo = `#${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      storeName: 'FOXY PAY',
      orderNo,
      amount: amt,
      total: amt,
      paymentMethod: method,
      paymentMethodLabel: method === 'CARD' ? 'CARD PAYMENT' : 'UPI PAYMENT',
      status: 'VERIFIED & PAID',
      date: dateFormatted,
      time: timeFormatted,
      dateTimeFull: `${dateFormatted} • ${timeFormatted}`,
      transactionId: txnId,
    };
  }, []);

  const [order, setOrder] = useState<OrderDetails>(() =>
    generateOrderDetails(0, 'CARD')
  );

  // 1. Toggle Power ON / OFF
  const handleTogglePower = () => {
    if (!isPoweredOn) {
      // Turn ON
      setIsPoweredOn(true);
      sound.playPowerOn();
      setScreenState('BOOTING');
      setTerminalMode('NORMAL');
      setAmount(0);
      setRawInput('');
      setPin('');
      setPaymentMethod(null);
      clearPressCountRef.current = 0;
      retroEnterPressCountRef.current = 0;
      keypadBufferRef.current = '';

      // Boot sequence -> Welcome -> Idle
      setTimeout(() => {
        setScreenState('WELCOME');
        setTimeout(() => {
          setScreenState('IDLE_CHOOSE_METHOD');
        }, 800);
      }, 1200);
    } else {
      // Turn OFF
      setIsPoweredOn(false);
      sound.playPowerOff();
      setScreenState('OFF');
      setTerminalMode('NORMAL');
      setAmount(0);
      setRawInput('');
      setPin('');
      setPaymentMethod(null);
      setIsReceiptModalOpen(false);
      setIsReceiptTorn(false);
      setIsTearing(false);
    }
  };

  // 2. Select Payment Method (CARD or UPI or null)
  const handleSelectPaymentMethod = (method: PaymentMethod | null) => {
    if (!isPoweredOn) return;
    sound.playKeypadClick('1');
    setPaymentMethod(method);
    keypadBufferRef.current = '';
    retroEnterPressCountRef.current = 0;
  };

  // 3. Digit Press Handling
  const handleDigitPress = (digit: string) => {
    if (!isPoweredOn) return;

    // Track raw keypad keystrokes for secret code recognition ONLY on UPI and CARD selection page
    if (screenState === 'IDLE_CHOOSE_METHOD' && !paymentMethod) {
      keypadBufferRef.current = (keypadBufferRef.current + digit).slice(-12);
      retroEnterPressCountRef.current = 0;
      return;
    }

    // A. PIN Entry Mode (during CARD payment flow)
    if (screenState === 'ENTERING_PIN') {
      if (pin.length < 4) {
        setPin(pin + digit);
      }
      return;
    }

    // B. Normal Amount Entry (after selecting CARD or UPI)
    if (
      screenState === 'IDLE_CHOOSE_METHOD' ||
      screenState === 'WELCOME' ||
      screenState === 'BOOTING'
    ) {
      if (!paymentMethod) {
        return;
      }
      if (rawInput.length >= 8) return;
      const nextRaw = rawInput + digit;
      setRawInput(nextRaw);
      const parsed = parseFloat(nextRaw);
      setAmount(!isNaN(parsed) ? parsed : 0);
    }
  };

  // 4. CLR Button Press Handling
  const handleClear = () => {
    if (!isPoweredOn) return;

    // If entering PIN: return back to enter amount section
    if (screenState === 'ENTERING_PIN') {
      setPin('');
      setScreenState('IDLE_CHOOSE_METHOD');
      return;
    }

    // If awaiting card tap or UPI scan: cancel back to idle
    if (
      screenState === 'AWAITING_CARD_TAP' ||
      screenState === 'AWAITING_UPI_SCAN' ||
      screenState === 'CARD_DETECTED'
    ) {
      setScreenState('IDLE_CHOOSE_METHOD');
      setPin('');
      return;
    }

    // If in COMPLETE state, restart payment
    if (screenState === 'COMPLETE') {
      handleNewPayment();
      return;
    }

    // Handle exiting easter egg modes
    if (terminalMode === 'DEVELOPER') {
      setTerminalMode('NORMAL');
      setRawInput('');
      setAmount(0);
      return;
    }

    if (terminalMode === 'RETRO_1987') {
      clearPressCountRef.current += 1;
      if (clearPressCountRef.current >= 2) {
        sound.playClearSound();
        setTerminalMode('NORMAL');
        clearPressCountRef.current = 0;
        setRawInput('');
        setAmount(0);
      } else {
        sound.playKeypadClick('CLR');
      }
      return;
    }

    // Reset secret triggers on CLR
    retroEnterPressCountRef.current = 0;
    keypadBufferRef.current = '';

    // Normal clear amount / reset selected payment method if already empty
    if (rawInput === '') {
      setPaymentMethod(null);
    } else {
      setRawInput('');
      setAmount(0);
    }
  };

  // 5. ENTER Button Press Handling
  const handleEnter = () => {
    if (!isPoweredOn) return;

    // If transaction is COMPLETE, ENTER triggers a new payment
    if (screenState === 'COMPLETE') {
      handleNewPayment();
      return;
    }

    // If in PIN entry mode: user presses ENTER to authorize payment
    if (screenState === 'ENTERING_PIN') {
      if (pin.length < 4) {
        sound.playClearSound();
        return;
      }

      // 4-digit PIN confirmed -> proceed to Authorizing -> Payment Success
      sound.playProcessingBeep();
      setScreenState('AUTHORIZING');

      setTimeout(() => {
        // Approved chime
        sound.playApprovedChime();
        setScreenState('PAYMENT_SUCCESSFUL');

        // Generate final order
        const finalOrder = generateOrderDetails(amount, 'CARD');
        setOrder(finalOrder);

        // Wait briefly (850ms) on PAYMENT SUCCESSFUL, then start single receipt feed
        setTimeout(() => {
          setScreenState('RECEIPT_DISPENSING');
        }, 850);
      }, 1300);
      return;
    }

    // Check Easter Egg Code: 14072003 with 3 consecutive ENTER presses
    // ONLY works on the UPI and CARD selection page (!paymentMethod && screenState === 'IDLE_CHOOSE_METHOD')
    const isSelectionPage = screenState === 'IDLE_CHOOSE_METHOD' && !paymentMethod;
    if (isSelectionPage && keypadBufferRef.current.endsWith('14072003')) {
      retroEnterPressCountRef.current += 1;
      sound.playKeypadClick('1');

      if (retroEnterPressCountRef.current >= 3) {
        sound.playRetroBoot();
        setTerminalMode('RETRO_1987');
        setRetroPhase('READY');
        retroEnterPressCountRef.current = 0;
        clearPressCountRef.current = 0;
        keypadBufferRef.current = '';
        setRawInput('');
        setAmount(0);
      }
      return;
    } else {
      retroEnterPressCountRef.current = 0;
    }

    // Check Easter Egg Codes:
    if (rawInput === '1987') {
      // Trigger Retro 1987 Mode
      sound.playRetroBoot();
      setTerminalMode('RETRO_1987');
      setRetroPhase('READY');
      setRawInput('');
      setAmount(0);
      return;
    }

    if (rawInput === '0000') {
      // Trigger Developer Diagnostics Mode
      sound.playDiagnosticChime();
      setTerminalMode('DEVELOPER');
      setRawInput('');
      setAmount(0);
      return;
    }

    // If in Developer or Retro Mode and user enters:
    if (terminalMode === 'DEVELOPER' || terminalMode === 'RETRO_1987') {
      return;
    }

    // Amount & Method Validation
    const currentAmount = parseFloat(rawInput);
    if (isNaN(currentAmount) || currentAmount <= 0) {
      sound.playClearSound();
      return;
    }

    // If no payment method was chosen yet, default to CARD
    const activeMethod = paymentMethod || 'CARD';
    if (!paymentMethod) {
      setPaymentMethod('CARD');
    }

    // A. CARD PAYMENT FLOW
    if (activeMethod === 'CARD') {
      setOrder(generateOrderDetails(currentAmount, 'CARD'));
      setScreenState('AWAITING_CARD_TAP');
      setPin('');
      return;
    }

    // B. UPI PAYMENT FLOW
    if (activeMethod === 'UPI') {
      const upiOrder = generateOrderDetails(currentAmount, 'UPI');
      setOrder(upiOrder);
      setScreenState('AWAITING_UPI_SCAN');
      sound.playQRScan();

      // Show real generated QR code for ~1.5 seconds, then auto-succeed
      setTimeout(() => {
        sound.playApprovedChime();
        setScreenState('PAYMENT_SUCCESSFUL');

        // Wait briefly (850ms) on PAYMENT SUCCESSFUL, then start single receipt feed
        setTimeout(() => {
          setScreenState('RECEIPT_DISPENSING');
        }, 850);
      }, 1600);
    }
  };

  // 6. Card Reader Tap Handling (when in AWAITING_CARD_TAP)
  const handleCardTap = () => {
    if (!isPoweredOn || screenState !== 'AWAITING_CARD_TAP') return;

    // Show CARD DETECTED animation
    setScreenState('CARD_DETECTED');

    // Transition to PIN entry after 600ms
    setTimeout(() => {
      setScreenState('ENTERING_PIN');
      setPin('');
    }, 600);
  };

  // 7. Reset to New Payment
  const handleNewPayment = () => {
    if (!isPoweredOn) return;
    sound.playClearSound();
    setAmount(0);
    setRawInput('');
    setPin('');
    setPaymentMethod(null);
    setScreenState('IDLE_CHOOSE_METHOD');
    setIsReceiptModalOpen(false);
    setIsReceiptTorn(false);
    setIsTearing(false);
  };

  // 8. Receipt printing complete callback
  const handlePrintComplete = () => {
    setScreenState('COMPLETE');
  };

  // 9. Tear Receipt Handler (triggered by clicking receipt OR pressing C/c on desktop/laptop keyboard)
  const handleTearReceipt = useCallback(() => {
    if (!isPoweredOn) return;
    if (isReceiptTorn || isTearing) return;
    if (screenState !== 'RECEIPT_DISPENSING' && screenState !== 'COMPLETE') return;

    setIsTearing(true);
    sound.playReceiptTear();

    // 450ms matches the tear cut animation duration
    setTimeout(() => {
      setIsTearing(false);
      setIsReceiptTorn(true);
      sound.playModalOpen();
      setIsReceiptModalOpen(true);
    }, 450);
  }, [isPoweredOn, isReceiptTorn, isTearing, screenState]);

  // Synchronized keyboard handlers ref for desktop & laptop physical keyboard support
  const keyboardHandlersRef = useRef({
    handleDigitPress,
    handleEnter,
    handleClear,
    handleTearReceipt,
    handleNewPayment,
  });

  useEffect(() => {
    keyboardHandlersRef.current = {
      handleDigitPress,
      handleEnter,
      handleClear,
      handleTearReceipt,
      handleNewPayment,
    };
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is inside a form input/textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // 1. Numeric keys 0-9 (laptop / desktop number row and numpad)
      if (e.key >= '0' && e.key <= '9') {
        if (terminalMode === 'RETRO_1987') {
          sound.playRetroKey();
        } else {
          sound.playKeypadClick(e.key);
        }
        keyboardHandlersRef.current.handleDigitPress(e.key);
        return;
      }

      // 2. Enter key -> FOXY PAY Enter button
      if (e.key === 'Enter') {
        e.preventDefault();
        sound.playEnterSound();
        keyboardHandlersRef.current.handleEnter();
        return;
      }

      // 3. Backspace key -> FOXY PAY CLR button
      if (e.key === 'Backspace') {
        e.preventDefault();
        sound.playClearSound();
        keyboardHandlersRef.current.handleClear();
        return;
      }

      // 4. 'C' or 'c' key -> Tear receipt function
      if (e.key === 'c' || e.key === 'C') {
        keyboardHandlersRef.current.handleTearReceipt();
        return;
      }

      // 5. 'N' or 'n' key -> New payment function
      if (e.key === 'n' || e.key === 'N') {
        keyboardHandlersRef.current.handleNewPayment();
        return;
      }
    };

    // Ensure Web Audio context is initialized and active on user interaction
    const unlockAudio = () => {
      sound.resumeContext();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', unlockAudio);
    };
  }, []);

  return (
    <main className="relative w-full min-h-[100dvh] flex flex-col items-center justify-center p-2 sm:p-4 py-3 sm:py-6 overflow-x-hidden overflow-y-auto bg-[#090b0e] text-slate-100 touch-manipulation">
      {/* Futuristic Self-Checkout Machine */}
      <CheckoutMachine
        screenState={screenState}
        isPoweredOn={isPoweredOn}
        paymentMethod={paymentMethod}
        amount={amount}
        rawInput={rawInput}
        pin={pin}
        order={order}
        mode={terminalMode}
        retroPhase={retroPhase}
        isTearing={isTearing}
        isReceiptTorn={isReceiptTorn}
        onTearReceipt={handleTearReceipt}
        onTogglePower={handleTogglePower}
        onSelectPaymentMethod={handleSelectPaymentMethod}
        onDigitPress={handleDigitPress}
        onClear={handleClear}
        onEnter={handleEnter}
        onCardTap={handleCardTap}
        onNewPayment={handleNewPayment}
        onOpenDetails={() => setIsReceiptModalOpen(true)}
        onPrintComplete={handlePrintComplete}
      />

      {/* Expanded Receipt Details & Print Modal */}
      <ReceiptDetailsModal
        isOpen={isReceiptModalOpen}
        order={order}
        onClose={() => setIsReceiptModalOpen(false)}
        onNewTransaction={handleNewPayment}
      />
    </main>
  );
}
