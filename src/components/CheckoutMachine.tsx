import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MachineScreenState,
  OrderDetails,
  TerminalMode,
  PaymentMethod,
} from '../types';
import { sound } from '../utils/sound';
import { Display } from './Display';
import { CardReaderPod } from './CardReaderPod';
import { Keypad } from './Keypad';
import { PowerControlPod } from './PowerControlPod';
import { Receipt } from './Receipt';

interface CheckoutMachineProps {
  screenState: MachineScreenState;
  isPoweredOn: boolean;
  paymentMethod: PaymentMethod | null;
  amount: number;
  rawInput: string;
  pin: string;
  order: OrderDetails;
  mode: TerminalMode;
  retroPhase: 'BOOT1' | 'BOOT2' | 'READY';
  isTearing?: boolean;
  isReceiptTorn?: boolean;
  onTearReceipt?: () => void;
  onTogglePower: () => void;
  onSelectPaymentMethod: (method: PaymentMethod | null) => void;
  onDigitPress: (digit: string) => void;
  onClear: () => void;
  onEnter: () => void;
  onCardTap: () => void;
  onNewPayment: () => void;
  onOpenDetails: () => void;
  onPrintComplete?: () => void;
}

export const CheckoutMachine: React.FC<CheckoutMachineProps> = ({
  screenState,
  isPoweredOn,
  paymentMethod,
  amount,
  rawInput,
  pin,
  order,
  mode,
  retroPhase,
  isTearing: propIsTearing,
  isReceiptTorn: propIsReceiptTorn,
  onTearReceipt,
  onTogglePower,
  onSelectPaymentMethod,
  onDigitPress,
  onClear,
  onEnter,
  onCardTap,
  onNewPayment,
  onOpenDetails,
  onPrintComplete,
}) => {
  const isVibrating =
    screenState === 'PAYMENT_SUCCESSFUL' ||
    screenState === 'RECEIPT_DISPENSING';

  // Playful chassis poke interaction state
  const [isPokeBouncing, setIsPokeBouncing] = useState(false);
  const [isPoked, setIsPoked] = useState(false);
  const bounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pokeMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Tear receipt physical animation and modal expansion state (supports external or internal state)
  const [localIsTearing, setLocalIsTearing] = useState(false);
  const [localIsReceiptTorn, setLocalIsReceiptTorn] = useState(false);

  const isTearing = propIsTearing !== undefined ? propIsTearing : localIsTearing;
  const isReceiptTorn = propIsReceiptTorn !== undefined ? propIsReceiptTorn : localIsReceiptTorn;

  useEffect(() => {
    // Reset torn state if new transaction begins or machine turned off
    if (
      screenState === 'OFF' ||
      screenState === 'BOOTING' ||
      screenState === 'WELCOME' ||
      screenState === 'IDLE_CHOOSE_METHOD' ||
      screenState === 'AWAITING_CARD_TAP' ||
      screenState === 'AWAITING_UPI_SCAN'
    ) {
      setLocalIsReceiptTorn(false);
      setLocalIsTearing(false);
    }

    // Immediately clear poke display message if turned off
    if (!isPoweredOn || screenState === 'OFF') {
      setIsPoked(false);
      if (pokeMessageTimeoutRef.current) clearTimeout(pokeMessageTimeoutRef.current);
    }
  }, [screenState, isPoweredOn]);

  useEffect(() => {
    return () => {
      if (bounceTimeoutRef.current) clearTimeout(bounceTimeoutRef.current);
      if (pokeMessageTimeoutRef.current) clearTimeout(pokeMessageTimeoutRef.current);
    };
  }, []);

  const handleTearReceipt = useCallback(() => {
    if (onTearReceipt) {
      onTearReceipt();
      return;
    }
    if (isReceiptTorn || isTearing) return;
    setLocalIsTearing(true);
    sound.playReceiptTear();

    // 450ms matches the tear cut animation duration
    setTimeout(() => {
      setLocalIsTearing(false);
      setLocalIsReceiptTorn(true);
      sound.playModalOpen();
      onOpenDetails();
    }, 450);
  }, [onTearReceipt, isReceiptTorn, isTearing, onOpenDetails]);

  const triggerBodyPoke = useCallback(() => {
    sound.playBodyTap();
    setIsPokeBouncing(false);
    requestAnimationFrame(() => {
      setIsPokeBouncing(true);
    });
    if (bounceTimeoutRef.current) clearTimeout(bounceTimeoutRef.current);
    bounceTimeoutRef.current = setTimeout(() => {
      setIsPokeBouncing(false);
    }, 200);

    // Only show display message when the machine is ON
    if (isPoweredOn && screenState !== 'OFF') {
      setIsPoked(true);
      if (pokeMessageTimeoutRef.current) clearTimeout(pokeMessageTimeoutRef.current);
      pokeMessageTimeoutRef.current = setTimeout(() => {
        setIsPoked(false);
      }, 1000);
    }
  }, [isPoweredOn, screenState]);

  const handleMachineBodyClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Check if clicked an interactive component
    const isInteractive = Boolean(
      target.closest(
        'button, a, input, select, textarea, [role="button"], #dispensed-receipt, #card-reader-pod, #numeric-keypad, #power-control-pod, [id^="terminal-screen"], #receipt-slot-slit'
      )
    );

    if (isInteractive) return;

    // User clicked an empty area of the machine housing
    triggerBodyPoke();
  };

  return (
    <div className="relative w-full max-w-[390px] sm:max-w-[420px] mx-auto flex flex-col items-center select-none my-auto">
      {/* Outer Machine Housing Enclosure */}
      <div
        id="checkout-terminal-body"
        onClick={handleMachineBodyClick}
        className={`relative w-full rounded-[2rem] sm:rounded-[2.5rem] p-3 sm:p-4 machine-chassis-outer select-none z-10 transition-all duration-300 ${
          isVibrating
            ? 'animate-machine-vibrate'
            : isPokeBouncing
            ? 'animate-poke-bounce'
            : ''
        }`}
      >
        {/* 4 Corner Hex / Torx Socket Screws */}
        <div className="absolute top-3.5 left-4 w-2.5 h-2.5 rounded-full bg-[#1b1e24] border border-slate-600/70 shadow-inner flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-slate-950" />
        </div>
        <div className="absolute top-3.5 right-4 w-2.5 h-2.5 rounded-full bg-[#1b1e24] border border-slate-600/70 shadow-inner flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-slate-950" />
        </div>
        <div className="absolute bottom-3.5 left-4 w-2.5 h-2.5 rounded-full bg-[#1b1e24] border border-slate-600/70 shadow-inner flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-slate-950" />
        </div>
        <div className="absolute bottom-3.5 right-4 w-2.5 h-2.5 rounded-full bg-[#1b1e24] border border-slate-600/70 shadow-inner flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-slate-950" />
        </div>

        {/* Inner Plate Housing */}
        <div className="relative rounded-[1.6rem] sm:rounded-[2rem] p-2.5 sm:p-3.5 machine-chassis-inner border border-slate-700/50 flex flex-col gap-2 sm:gap-2.5">
          {/* Top Header: Recessed pill with cyan accent lines and FOXY PAY title */}
          <div className="w-full flex items-center justify-center py-0.5 sm:py-1">
            <div className="px-3.5 py-0.5 sm:py-1 rounded-full bg-[#0d1014] border border-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] flex items-center gap-2">
              <div className="w-4 sm:w-6 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
              <span className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] text-slate-200 uppercase font-mono">
                FOXY PAY
              </span>
              <div className="w-4 sm:w-6 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
            </div>
          </div>

          {/* Upper Section: Display Screen (Left ~68%) + Card Reader Pod (Right ~32%) */}
          <div className="grid grid-cols-10 gap-1.5 sm:gap-2 items-stretch">
            {/* Left: Main Display Screen */}
            <div className="col-span-7 min-w-0 rounded-2xl overflow-hidden shadow-[inset_0_3px_8px_rgba(0,0,0,0.95)] flex flex-col">
              <Display
                screenState={screenState}
                paymentMethod={paymentMethod}
                onSelectPaymentMethod={onSelectPaymentMethod}
                amount={amount}
                rawInput={rawInput}
                pin={pin}
                mode={mode}
                retroPhase={retroPhase}
                isPoked={isPoked}
                onNewPayment={onNewPayment}
                order={order}
                isReceiptTorn={isReceiptTorn}
              />
            </div>

            {/* Right: Dedicated Card Reader / Tap To Pay Pod */}
            <div className="col-span-3 min-w-0 flex flex-col">
              <CardReaderPod
                screenState={screenState}
                isPoweredOn={isPoweredOn}
                onCardTap={onCardTap}
                mode={mode}
              />
            </div>
          </div>

          {/* Middle Section: Numeric Keypad (Left ~68%) + Power Control Unit (Right ~32%) */}
          <div className="grid grid-cols-10 gap-1.5 sm:gap-2 items-stretch">
            {/* Left: Numeric Keypad (1-9, CLR, 0, ENTER) */}
            <div className="col-span-7 min-w-0">
              <Keypad
                isPoweredOn={isPoweredOn}
                disabled={
                  screenState === 'OFF' ||
                  screenState === 'BOOTING' ||
                  screenState === 'AUTHORIZING' ||
                  screenState === 'PAYMENT_SUCCESSFUL'
                }
                onDigitPress={onDigitPress}
                onClear={onClear}
                onEnter={onEnter}
                mode={mode}
              />
            </div>

            {/* Right: Physical ON/OFF Power Button & Machine Status LED Plate */}
            <div className="col-span-3 min-w-0">
              <PowerControlPod
                isPoweredOn={isPoweredOn}
                onTogglePower={onTogglePower}
              />
            </div>
          </div>

          {/* Bottom Section: Dedicated Receipt Bay & Slot with Real Emerging Receipt */}
          <div className="relative w-full rounded-2xl p-2 bg-[#0d0f13] border border-slate-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center">
            {/* Glowing Horizontal Receipt Slot Slit Container */}
            <div className="relative w-full flex justify-center items-center">
              {/* Physical Emerged Paper Attached Directly to Slot Mouth */}
              <Receipt
                screenState={screenState}
                order={order}
                onOpenDetails={onOpenDetails}
                onPrintComplete={onPrintComplete}
                isTearing={isTearing}
                isTorn={isReceiptTorn}
                onTear={handleTearReceipt}
              />

              {/* Glowing Horizontal Receipt Slot Slit */}
              <div
                id="receipt-slot-slit"
                className="relative z-30 w-56 sm:w-64 h-2.5 rounded-full bg-[#05080c] border border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.5),inset_0_2px_4px_rgba(0,0,0,0.95)] flex items-center justify-center pointer-events-none"
              >
                <div className="w-[94%] h-0.5 bg-black rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Machine Pedestal Rubberized Feet */}
        <div className="absolute -bottom-2 left-10 w-10 h-2 bg-[#121417] rounded-b-md border-t border-black shadow-md" />
        <div className="absolute -bottom-2 right-10 w-10 h-2 bg-[#121417] rounded-b-md border-t border-black shadow-md" />
      </div>
    </div>
  );
};
