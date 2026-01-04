// Payment module
// This module handles payment-related functionality

export function processPaymentMethod(method, amount) {
    switch(method) {
        case 'bank-transfer':
            return {
                method: 'Transfer Bank',
                details: {
                    bank: 'BCA',
                    accountNumber: '1234567890',
                    accountName: 'Tourify',
                    amount: amount
                }
            };
        case 'e-wallet':
            return {
                method: 'E-Wallet',
                details: {
                    provider: 'GoPay / OVO / Dana',
                    number: '0812-3456-7890',
                    accountName: 'Tourify',
                    amount: amount
                }
            };
        case 'credit-card':
            return {
                method: 'Kartu Kredit',
                details: {
                    cardType: 'Visa / Mastercard',
                    amount: amount,
                    secure: true
                }
            };
        default:
            return null;
    }
}

export function validatePaymentDetails(method, details) {
    switch(method) {
        case 'bank-transfer':
            return true;
        case 'e-wallet':
            return true;
        case 'credit-card':
            if (!details.cardNumber || !details.expDate || !details.cvv) {
                return false;
            }
            return validateCreditCard(details.cardNumber);
        default:
            return false;
    }
}

function validateCreditCard(cardNumber) {
    // Simple Luhn algorithm validation
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length !== 16) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

export function simulatePaymentProcessing() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                transactionId: 'TXN_' + Date.now(),
                timestamp: new Date().toISOString()
            });
        }, 2000);
    });
}

export function generateInvoice(booking) {
    return {
        invoiceNumber: 'INV_' + booking.id,
        date: new Date().toISOString(),
        customer: {
            name: booking.visitorName,
            email: booking.visitorEmail,
            phone: booking.visitorPhone
        },
        details: {
            destination: booking.destinationName,
            date: booking.date,
            tickets: booking.tickets,
            ticketPrice: booking.ticketPrice,
            guidePrice: booking.guidePrice || 0
        },
        total: booking.totalPrice,
        paymentMethod: booking.paymentMethod,
        status: booking.status
    };
}
