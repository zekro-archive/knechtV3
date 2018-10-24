SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
CREATE DATABASE IF NOT EXISTS `knecht` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `knecht`;

DROP TABLE IF EXISTS `chatflags`;
CREATE TABLE `chatflags` (
  `time` date NOT NULL,
  `user` text NOT NULL,
  `msg` text NOT NULL,
  `channel` text NOT NULL,
  `channelname` text NOT NULL,
  `type` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `cmdlog`;
CREATE TABLE `cmdlog` (
  `uid` text NOT NULL,
  `uname` text NOT NULL,
  `cmd` text NOT NULL,
  `content` text NOT NULL,
  `timestamp` text NOT NULL,
  `chanid` text NOT NULL,
  `channame` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `github`;
CREATE TABLE `github` (
  `uid` text NOT NULL,
  `gitid` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `muted`;
CREATE TABLE `muted` (
  `victim` text NOT NULL,
  `expires` bigint(20) NOT NULL,
  `reporter` text NOT NULL,
  `reason` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `namepoll`;
CREATE TABLE `namepoll` (
  `name` text NOT NULL,
  `user` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `rep`;
CREATE TABLE `rep` (
  `member` text NOT NULL,
  `value` mediumint(9) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports` (
  `victim` text NOT NULL,
  `reporter` text NOT NULL,
  `date` text NOT NULL,
  `reason` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `key` text NOT NULL,
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `stats`;
CREATE TABLE `stats` (
  `time` text NOT NULL,
  `users` int(11) NOT NULL,
  `online` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags` (
  `name` text NOT NULL,
  `creator` text NOT NULL,
  `content` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `userbots`;
CREATE TABLE `userbots` (
  `botid` text NOT NULL,
  `ownerid` text NOT NULL,
  `prefix` text NOT NULL,
  `whitelisted` tinyint(4) DEFAULT '0',
  `apitoken` text NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '0',
  `uptime` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `xp`;
CREATE TABLE `xp` (
  `uid` text NOT NULL,
  `xp` bigint(20) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
CREATE DATABASE IF NOT EXISTS `knecht` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `knecht`;

DROP TABLE IF EXISTS `chatflags`;
CREATE TABLE `chatflags` (
  `time` date NOT NULL,
  `user` text NOT NULL,
  `msg` text NOT NULL,
  `channel` text NOT NULL,
  `channelname` text NOT NULL,
  `type` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `cmdlog`;
CREATE TABLE `cmdlog` (
  `uid` text NOT NULL,
  `uname` text NOT NULL,
  `cmd` text NOT NULL,
  `content` text NOT NULL,
  `timestamp` text NOT NULL,
  `chanid` text NOT NULL,
  `channame` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `github`;
CREATE TABLE `github` (
  `uid` text NOT NULL,
  `gitid` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `muted`;
CREATE TABLE `muted` (
  `victim` text NOT NULL,
  `expires` bigint(20) NOT NULL,
  `reporter` text NOT NULL,
  `reason` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `namepoll`;
CREATE TABLE `namepoll` (
  `name` text NOT NULL,
  `user` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `rep`;
CREATE TABLE `rep` (
  `member` text NOT NULL,
  `value` mediumint(9) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports` (
  `victim` text NOT NULL,
  `reporter` text NOT NULL,
  `date` text NOT NULL,
  `reason` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `key` text NOT NULL,
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `stats`;
CREATE TABLE `stats` (
  `time` text NOT NULL,
  `users` int(11) NOT NULL,
  `online` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags` (
  `name` text NOT NULL,
  `creator` text NOT NULL,
  `content` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `userbots`;
CREATE TABLE `userbots` (
  `botid` text NOT NULL,
  `ownerid` text NOT NULL,
  `prefix` text NOT NULL,
  `whitelisted` tinyint(4) DEFAULT '0',
  `apitoken` text NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '0',
  `uptime` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `xp`;
CREATE TABLE `xp` (
  `uid` text NOT NULL,
  `xp` bigint(20) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
