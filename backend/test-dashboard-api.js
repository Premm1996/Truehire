// Test script to verify dashboard API endpoints
const fetch = require('node-fetch');

async function testDashboardAPIs() {
  try {
    console.log('🧪 Testing Dashboard API Endpoints...\n');

    // Test stats endpoint
    console.log('📊 Testing /api/admin/employees/stats...');
    const statsResponse = await fetch('http://localhost:5000/api/admin/employees/stats', {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Stats endpoint working!');
      console.log('📈 Stats data:', JSON.stringify(stats, null, 2));
    } else {
      console.log('❌ Stats endpoint failed:', statsResponse.status, statsResponse.statusText);
    }

    // Test employees endpoint
    console.log('\n👥 Testing /api/admin/employees...');
    const employeesResponse = await fetch('http://localhost:5000/api/admin/employees', {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (employeesResponse.ok) {
      const employeesData = await employeesResponse.json();
      console.log('✅ Employees endpoint working!');
      console.log(`📋 Found ${employeesData.employees?.length || 0} employees`);
      console.log('📊 Employees stats:', JSON.stringify(employeesData.stats, null, 2));

      if (employeesData.employees && employeesData.employees.length > 0) {
        console.log('\n👤 Sample employee:');
        console.log(`   Name: ${employeesData.employees[0].firstName} ${employeesData.employees[0].lastName}`);
        console.log(`   Email: ${employeesData.employees[0].email}`);
        console.log(`   Status: ${employeesData.employees[0].status}`);
      }
    } else {
      console.log('❌ Employees endpoint failed:', employeesResponse.status, employeesResponse.statusText);
    }

    // Test analytics endpoint
    console.log('\n📈 Testing /api/admin/analytics...');
    const analyticsResponse = await fetch('http://localhost:5000/api/admin/analytics', {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (analyticsResponse.ok) {
      const analyticsData = await analyticsResponse.json();
      console.log('✅ Analytics endpoint working!');
      console.log('📊 Analytics data:', JSON.stringify(analyticsData, null, 2));
    } else {
      console.log('❌ Analytics endpoint failed:', analyticsResponse.status, analyticsResponse.statusText);
    }

    console.log('\n🎉 Dashboard API testing completed!');

  } catch (error) {
    console.error('❌ Error testing APIs:', error.message);
  }
}

testDashboardAPIs();
