export default function QRPayment({ bankAccounts }) {
  if (!bankAccounts?.length) return null;

  return (
    <div className="space-y-4">
      <p className="text-green-900 font-medium">
        Vui lòng quét mã QR để thanh toán và ghi nội dung đơn hàng.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bankAccounts.map((acc) => (
          <div
            key={acc._id}
            className="border border-green-200 rounded-xl p-4 bg-green-50/50"
          >
            <p className="font-bold text-green-900">{acc.bankName}</p>
            <p className="text-gray-700">Chủ tài khoản: {acc.accountHolder}</p>
            <p className="text-gray-700 font-mono">Số TK: {acc.accountNumber}</p>
            {acc.qrImage && (
              <div className="mt-3">
                <img
                  src={acc.qrImage}
                  alt="QR thanh toán"
                  className="w-40 h-40 object-contain border border-green-200 rounded"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
