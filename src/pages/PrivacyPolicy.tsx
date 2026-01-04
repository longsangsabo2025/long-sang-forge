import { Layout } from "@/components/LayoutWithChat";
import { motion } from "framer-motion";
import { ArrowLeft, Database, Eye, Lock, Mail, Shield } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  const sections = [
    {
      icon: Database,
      title: t("privacy.sections.collection.title"),
      content: t("privacy.sections.collection.content"),
    },
    {
      icon: Eye,
      title: t("privacy.sections.usage.title"),
      content: t("privacy.sections.usage.content"),
    },
    {
      icon: Lock,
      title: t("privacy.sections.protection.title"),
      content: t("privacy.sections.protection.content"),
    },
    {
      icon: Shield,
      title: t("privacy.sections.rights.title"),
      content: t("privacy.sections.rights.content"),
    },
  ];

  return (
    <Layout>
      <Helmet>
        <title>{t("privacy.title")} | longsang.org</title>
        <meta name="description" content={t("privacy.description")} />
        <meta property="og:title" content={`${t("privacy.title")} | longsang.org`} />
        <meta property="og:description" content={t("privacy.intro")} />
        <link rel="canonical" href="https://longsang.org/privacy" />
      </Helmet>
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("privacy.backHome")}
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">{t("privacy.title")}</h1>
            <p className="text-muted-foreground">
              {t("privacy.lastUpdated")}: {t("privacy.updateDate")}
            </p>
          </motion.div>

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-card/50 border border-border/50 rounded-xl p-6 mb-8"
          >
            <p className="text-foreground/90 leading-relaxed">{t("privacy.intro")}</p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="bg-card/30 border border-border/30 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <section.icon className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-muted-foreground mb-4">{t("privacy.questions")}</p>
            <a
              href="mailto:contact@longsang.org"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <Mail className="w-4 h-4" />
              contact@longsang.org
            </a>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
