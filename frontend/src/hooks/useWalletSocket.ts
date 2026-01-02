'use client';

import { useEffect, useRef } from 'react';
import { socketService } from '@/services/socket';
import { useWalletStore } from '@/stores/wallet.store';
import { PersonalExpense, Beneficiary } from '@/types';
import toast from 'react-hot-toast';

export function useWalletSocket(walletId: string | null) {
  const isSetup = useRef(false);
  const currentWalletRef = useRef<string | null>(null);
  
  const {
    selectedMonth,
    selectedYear,
    fetchWallet,
    fetchExpenses,
    fetchSummary,
    fetchBeneficiaries,
  } = useWalletStore();

  // Guardar valores actuales en refs para usar en callbacks
  const monthRef = useRef(selectedMonth);
  const yearRef = useRef(selectedYear);
  
  useEffect(() => {
    monthRef.current = selectedMonth;
    yearRef.current = selectedYear;
  }, [selectedMonth, selectedYear]);

  // Conectar y configurar listeners UNA sola vez
  useEffect(() => {
    if (!walletId) return;
    
    // Evitar setup múltiple para la misma wallet
    if (currentWalletRef.current === walletId && isSetup.current) {
      return;
    }

    currentWalletRef.current = walletId;
    isSetup.current = true;

    const setupSocket = async () => {
      try {
        await socketService.joinWallet(walletId);

        // Configurar listeners (el servicio remueve los anteriores automáticamente)
        socketService.onExpenseCreated((expense: PersonalExpense) => {
          console.log('💰 Nuevo gasto recibido');
          fetchExpenses(walletId, monthRef.current, yearRef.current);
          fetchSummary(walletId, monthRef.current, yearRef.current);
          toast.success(`💰 Nuevo gasto: ${expense.description}`, { 
            duration: 3000,
            icon: '🔔'
          });
        });

        socketService.onExpenseUpdated((expense: PersonalExpense) => {
          console.log('📝 Gasto actualizado');
          fetchExpenses(walletId, monthRef.current, yearRef.current);
          fetchSummary(walletId, monthRef.current, yearRef.current);
        });

        socketService.onExpenseDeleted(() => {
          console.log('🗑️ Gasto eliminado');
          fetchExpenses(walletId, monthRef.current, yearRef.current);
          fetchSummary(walletId, monthRef.current, yearRef.current);
        });

        socketService.onMemberJoined((member) => {
          console.log('👋 Nuevo miembro:', member?.name);
          fetchWallet(walletId);
          if (member?.name) {
            toast.success(`${member.name} se unió a la billetera`, { 
              duration: 3000,
              icon: '🎉'
            });
          }
        });

        socketService.onMemberRemoved(() => {
          console.log('🚪 Miembro removido');
          fetchWallet(walletId);
        });

        socketService.onBeneficiaryCreated((beneficiary: Beneficiary) => {
          console.log('🐾 Nuevo beneficiario:', beneficiary?.name);
          fetchBeneficiaries(walletId);
        });

        socketService.onBeneficiaryDeleted(() => {
          console.log('🗑️ Beneficiario eliminado');
          fetchBeneficiaries(walletId);
        });

      } catch (error) {
        console.error('Error configurando socket:', error);
      }
    };

    setupSocket();

    // Cleanup cuando cambia la wallet o se desmonta
    return () => {
      if (walletId) {
        socketService.leaveWallet(walletId);
      }
      isSetup.current = false;
      currentWalletRef.current = null;
    };
  }, [walletId]); // Solo depender de walletId

  return { isConnected: socketService.isConnected };
}
