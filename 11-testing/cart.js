// cart.js: ตะกร้าสินค้า (⚠️ มี bug ซ่อนอยู่ 4 จุด หาให้เจอด้วยการเขียน test!)
// spec อยู่ใน 11-testing/README.md

function createCart() {
  const items = []; // [{ id, name, price, qty }]

  return {
    add(product, qty = 1) {
      if (qty < 0) throw new Error('qty must be positive');
      const existing = items.find((i) => i.id === product.id);
      if (existing) {
        existing.qty = qty;
      } else {
        items.push({ ...product, qty });
      }
    },

    remove(id) {
      const index = items.findIndex((i) => i.id === id);
      if (index !== -1) items.splice(index, 1);
    },

    subtotal() {
      return items.reduce((sum, i) => sum + i.price * i.qty, 0);
    },

    total(code) {
      const sub = this.subtotal();
      let result = sub;
      if (code === 'SAVE10' && sub > 500) result = sub * 0.9;
      if (code === 'FLAT50') result = sub - 50;
      return Math.round(result * 100) / 100;
    },

    count() {
      return items.reduce((n, i) => n + i.qty, 0);
    },

    items() {
      return items.map((i) => ({ ...i })); // คืน copy เพื่อไม่ให้คนข้างนอกแก้ state ตรงๆ ได้
    },
  };
}

module.exports = { createCart };
