import BankAccount from '../models/BankAccount.js';

export async function getBankAccounts(req, res) {
  try {
    const list = await BankAccount.find().sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createBankAccount(req, res) {
  try {
    const { bankName, accountNumber, accountHolder, qrImage } = req.body;
    const qr = req.file ? `/uploads/${req.file.filename}` : (qrImage || '');
    const account = await BankAccount.create({
      bankName,
      accountNumber,
      accountHolder,
      qrImage: qr,
    });
    res.status(201).json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateBankAccount(req, res) {
  try {
    const account = await BankAccount.findById(req.params.id);
    if (!account) return res.status(404).json({ message: 'Bank account not found' });
    const { bankName, accountNumber, accountHolder, qrImage } = req.body;
    if (bankName !== undefined) account.bankName = bankName;
    if (accountNumber !== undefined) account.accountNumber = accountNumber;
    if (accountHolder !== undefined) account.accountHolder = accountHolder;
    if (req.file) account.qrImage = `/uploads/${req.file.filename}`;
    else if (qrImage !== undefined) account.qrImage = qrImage;
    await account.save();
    res.json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteBankAccount(req, res) {
  try {
    const account = await BankAccount.findByIdAndDelete(req.params.id);
    if (!account) return res.status(404).json({ message: 'Bank account not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
