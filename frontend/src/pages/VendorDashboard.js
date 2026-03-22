import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';

const VendorDashboard = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8" data-testid="vendor-dashboard">
        <h1 className="text-3xl font-bold text-[#1A2F23] mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>Vendor Dashboard</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-600">Vendor features coming soon...</p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default VendorDashboard;
