import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function addVungtauProject() {
  console.log('🏠 Adding Vũng Tàu Dream Homes to app_showcase...');

  try {
    // Insert Vũng Tàu Dream Homes project
    const { data, error } = await supabase
      .from('app_showcase')
      .upsert({
        app_id: 'vungtau-dream-homes',
        app_name: 'Vũng Tàu Dream Homes',
        slug: 'vungtau-dream-homes',
        icon: '🏠',
        tagline: 'Nền tảng BDS hàng đầu Vũng Tàu',
        description: 'Kết nối người mua, người bán và môi giới với hàng nghìn BDS uy tín tại Vũng Tàu - Bà Rịa',
        production_url: 'https://vungtau-dream-homes.vercel.app',
        status: 'published',
        
        // Hero Section (JSONB)
        hero: {
          title: 'VŨNG TÀU DREAM HOMES',
          subtitle: 'Nền tảng tìm kiếm bất động sản hàng đầu Vũng Tàu',
          description: 'Kết nối người mua, người bán và môi giới với hàng nghìn BDS uy tín tại Vũng Tàu - Bà Rịa',
          ctaPrimary: { text: 'Khám Phá BDS', url: '#properties' },
          ctaSecondary: { text: 'Liên Hệ Môi Giới', url: '#agents' },
          backgroundImage: '/vungtau-hero.jpg',
          stats: [
            { label: 'BDS Listings', value: '1,000+', icon: '🏘️' },
            { label: 'Môi Giới', value: '500+', icon: '👥' },
            { label: 'Khu Vực', value: '50+', icon: '�' },
            { label: 'Tìm Kiếm/Ngày', value: '2,500+', icon: '🔍' }
          ]
        },
        
        // Branding (JSONB)
        branding: {
          primaryColor: '#10b981',
          secondaryColor: '#3b82f6',
          accentColor: '#f59e0b',
          logo: '/vungtau-logo.png',
          favicon: '/vungtau-favicon.ico'
        },
        
        // Downloads (JSONB) - Not applicable for web platform
        downloads: {
          appStore: null,
          playStore: null,
          web: 'https://vungtau-dream-homes.vercel.app'
        },
        
        // Social (JSONB)
        social: {
          facebook: 'https://facebook.com/vungtaudreamhomes',
          instagram: 'https://instagram.com/vungtaudreamhomes',
          twitter: null,
          linkedin: null,
          youtube: null
        },
        
        // Features (JSONB array)
        features: [
          {
            title: 'Tìm Kiếm Thông Minh',
            description: 'Công cụ tìm kiếm với bộ lọc theo khu vực, giá, diện tích, loại hình BDS',
            icon: '🔍',
            image: '/vungtau-features/search.png'
          },
          {
            title: '1,000+ BDS Uy Tín',
            description: 'Database lớn nhất khu vực với BDS từ 500+ môi giới được verify',
            icon: '🏘️',
            image: '/vungtau-features/listings.png'
          },
          {
            title: 'Maps Integration',
            description: 'Xem vị trí BDS trên bản đồ, tính khoảng cách tới điểm quan trọng',
            icon: '🗺️',
            image: '/vungtau-features/maps.png'
          },
          {
            title: 'Mobile Optimized',
            description: 'Giao diện responsive, tối ưu cho mọi thiết bị di động',
            icon: '📱',
            image: '/vungtau-features/mobile.png'
          },
          {
            title: 'Kết Nối Trực Tiếp',
            description: 'Liên hệ môi giới ngay trên platform, không qua trung gian',
            icon: '�',
            image: '/vungtau-features/contact.png'
          },
          {
            title: 'Đa Dạng Loại Hình',
            description: 'Nhà, đất, chung cư, cho thuê - đầy đủ các loại BDS',
            icon: '🏡',
            image: '/vungtau-features/types.png'
          }
        ],
        
        // CTA Section (JSONB)
        cta: {
          title: 'Tìm Ngôi Nhà Mơ Ước Của Bạn',
          description: 'Khám phá hàng nghìn bất động sản uy tín tại Vũng Tàu. Kết nối với môi giới chuyên nghiệp ngay hôm nay!',
          buttonText: 'Bắt Đầu Tìm Kiếm',
          buttonUrl: 'https://vungtau-dream-homes.vercel.app',
          backgroundImage: '/vungtau-cta-bg.jpg'
        },
        
        updated_at: new Date().toISOString(),
        published_at: new Date().toISOString()
      }, {
        onConflict: 'app_id'
      });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Successfully added Vũng Tàu Dream Homes!');
    console.log('📊 Data:', data);
    console.log('\n🔗 Access URLs:');
    console.log('   - Showcase Detail: http://localhost:8080/app-showcase/vungtau-dream-homes');
    console.log('   - Project Showcase: http://localhost:8080/project-showcase');
    console.log('   - Production: https://vungtau-dream-homes.vercel.app');

  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

addVungtauProject();
