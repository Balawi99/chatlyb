const express = require('express');
const { protect } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const prisma = new PrismaClient();
const router = express.Router();

// Apply authentication middleware to most widget routes
router.use(protect);

// Get widget configuration for the authenticated user
router.get('/', async (req, res) => {
  try {
    const widget = await prisma.widget.findUnique({
      where: {
        tenantId: req.tenantId
      }
    });

    if (!widget) {
      return res.status(404).json({
        message: 'Widget configuration not found'
      });
    }

    res.status(200).json({
      data: widget
    });
  } catch (error) {
    console.error('Error fetching widget configuration:', error);
    res.status(500).json({
      message: 'Error fetching widget configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Update widget configuration
router.put('/', async (req, res) => {
  try {
    const { color, position, welcomeText, logoUrl, aiSettings } = req.body;
    const tenantId = req.tenantId;

    // Get the current widget
    const widget = await prisma.widget.findUnique({
      where: { tenantId }
    });

    if (!widget) {
      return res.status(404).json({
        message: 'Widget configuration not found'
      });
    }

    // Update the widget configuration
    const updatedWidget = await prisma.widget.update({
      where: { tenantId },
      data: {
        ...(color && { color }),
        ...(position && { position }),
        ...(welcomeText && { welcomeText }),
        ...(logoUrl && { logoUrl }),
        ...(aiSettings && { aiSettings: JSON.stringify(aiSettings) }),
      }
    });

    res.status(200).json({
      message: 'Widget configuration updated successfully',
      data: {
        ...updatedWidget,
        aiSettings: updatedWidget.aiSettings ? JSON.parse(updatedWidget.aiSettings) : null
      }
    });
  } catch (error) {
    console.error('Error updating widget configuration:', error);
    res.status(500).json({
      message: 'Error updating widget configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Get embed code for the widget - No authentication required
router.get('/embed', async (req, res) => {
  try {
    // الحصول على معرف المستأجر من الطلب إذا كان موجوداً، أو استخدام قيمة افتراضية
    const tenantId = req.tenantId || '24e1eabe-6b95-41eb-94fa-700ed31fa7b3';
    
    // Get the host from the request
    const host = req.get('host') || 'localhost:8000';
    const protocol = req.protocol || 'http';
    
    // Generate embed code with absolute URL
    const embedCode = `
<script>
  /* 
   * Chatly Widget Embed Code
   * ==============================================
   * 
   * هام: بيئة التطوير المحلية
   * --------------------------
   * هذا الكود مخصص للاستخدام المحلي. إذا كنت تريد استخدامه في بيئة إنتاج،
   * يجب تغيير عنوان URL أدناه ليتوافق مع عنوان خادم API الخاص بك.
   * 
   * مثال للإنتاج:
   * (window, document, 'script', 'https://example.com/widget.js')
   * 
   * ملاحظة أمان: 
   * عند التضمين في موقع عام، تأكد من أن خادم API يدعم HTTPS
   * وأن لديه شهادة SSL صالحة.
   */
  (function(w, d, t, u) {
    // إعداد بيانات التهيئة للويدجت
    const chatlyEmbed = w.chatlyEmbed = w.chatlyEmbed || {};
    chatlyEmbed.tenantId = "${tenantId}";
    
    // إنشاء عنصر السكريبت وتهيئته
    const h = d.createElement(t);
    h.src = u;
    h.async = 1;
    
    // إضافة معالج أخطاء لتسهيل تصحيح الأخطاء
    h.onerror = function(e) {
      console.error('Chatly Widget: Error loading script', e);
    };
    
    // إضافة السكريبت للصفحة
    const s = d.getElementsByTagName(t)[0];
    s.parentNode.insertBefore(h, s);
  })(window, document, 'script', '${protocol}://${host}/widget.js');
</script>`;

    res.status(200).json({
      data: {
        embedCode,
        // إضافة معلومات إضافية لتسهيل التضمين في الإنتاج
        productionExample: `https://your-production-api-server.com/widget.js`,
        tenantId: tenantId
      }
    });
  } catch (error) {
    console.error('Error generating embed code:', error);
    res.status(500).json({
      message: 'Error generating embed code',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Remove authentication for this route to allow public access to widget config by tenant ID
router.get('/public/:tenantId', cors({ 
  origin: true,
  exposedHeaders: ['Access-Control-Allow-Private-Network']
}), async (req, res) => {
  try {
    const { tenantId } = req.params;

    const widget = await prisma.widget.findUnique({
      where: {
        tenantId
      },
      select: {
        color: true,
        position: true,
        welcomeText: true,
        logoUrl: true
      }
    });

    if (!widget) {
      return res.status(404).json({
        message: 'Widget configuration not found'
      });
    }

    res.status(200).json({
      data: widget
    });
  } catch (error) {
    console.error('Error fetching public widget configuration:', error);
    res.status(500).json({
      message: 'Error fetching public widget configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router; 