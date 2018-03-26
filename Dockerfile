#
#

FROM havnesvo/slimerjs
MAINTAINER Cheng Wang <cwang@splunk.com>

RUN sed -i "/^# deb.*multiverse/ s/^# //" /etc/apt/sources.list &&\
    apt-get update 
RUN  echo y| apt-get install flashplugin-installer 

#ADD ./phantomjs /phantomjs/script