package Main::Roles::ResourcesOptimizerApp;
use Moose::Role;

use JavaScript::Packer;
use CSS::Packer;
use HTML::Packer;
use JSON;

our $packer = {};

sub __getFileContent {
    my ( $self, $file ) = @_;
    if ( !-e $file ) {
        $self->log->error( sprintf( 'Resource not found: %s', $file ) );
        return '';
    }
    open( my $UNCOMPRESSED, '<', $file );
    my $content = join( '', <$UNCOMPRESSED> );
    close($UNCOMPRESSED);

    return $content;
}

sub __minify {
    my ( $self, $type, $content ) = @_;
    return $$packer{$type}->minify( \$content, $$packer{options}{$type} );
}

sub resourcesInit {
    my ($self) = @_;
    if ( $ENV{live} ) {
        $self->log->info('Preparing resources');

        my $resources   = $self->config->{resources};
        my $path        = $self->config->{'View::Web'}->{INCLUDE_PATH}->[0];
        my $destination = $path . $$resources{destination};

        # Minify the resources
        $$packer{css}  = CSS::Packer->init();
        $$packer{js}   = JavaScript::Packer->init();
        $$packer{html} = HTML::Packer->init();

        #$$packer{html}->do_javascript('best');
        $$packer{html}->do_stylesheet('minify');

        $$packer{options} = {
            css  => { compress => 'minify' },
            js   => { compress => 'best' },
            html => {
                remove_newlines => 1,
                remove_comments => 1,
            },
        };

        my $css      = $$resources{css};         # array
        my $mustache = $$resources{mustache};    # hash
        my $js       = $$resources{js};          # array

        if (@$css) {
            $self->log->info('Preparing CSS Resources');
            my @all;
            foreach my $_css (@$css) {
                my $fname = $path . $_css;
                $self->log->info( sprintf( 'CSS: %s', $fname ) );
                push( @all, $self->__getFileContent($fname) );
            }

            my $filename = $destination . '/all.css';
            $self->log->info(
                sprintf( 'Minifying CSS into: %s', $filename ) );
            my $_all = $self->__minify( 'css', join( "\n", @all ) );

            if ( open( my $fh, '>', $filename ) ) {
                print $fh $_all;
                close $fh;
            }
            else {
                $self->log->error("Could not open file '$filename' $!");
            }
            $self->log->info('CSS Resources Completed');
        }

        my $mustache_templates = {};
        if (%$mustache) {
            $self->log->info('Preparing Mustache Resources');
            foreach my $template ( keys %$mustache ) {
                my $fname = $path . $$mustache{$template};
                $self->log->info( sprintf( 'Mustache: %s', $fname ) );
                $$mustache_templates{$template} = $self->__minify( 'html',
                    $self->__getFileContent($fname) );
            }
            $self->log->info('Mustache Resources Completed');
        }

        if (@$js) {

            # Add mustache templates
            $self->log->info('JS: MUSTACHE_TEMPLATES');
            my @all
                = (   'MUSTACHE_TEMPLATES='
                    . encode_json($mustache_templates)
                    . ';' );

            foreach my $_js (@$js) {
                my $fname = $path . $_js;
                $self->log->info( sprintf( 'JS: %s', $fname ) );
                push( @all, $self->__getFileContent($fname) );
            }

            #my $_all = $self->__minify('js', join("\n", @all));
            my $_all = join( "\n", @all );
            my $raw_filename = $destination . '/all.raw.js';
            $self->log->info( sprintf( 'All JS into: %s', $raw_filename ) );
            if ( open( my $fh, '>', $raw_filename ) ) {
                print $fh $_all;
                close $fh;
            }
            else {
                $self->log->error("Could not open file '$raw_filename' $!");
            }

            my $bin = Papertopc->path_to('../bin')->stringify;
            $_all
                = `java -jar $bin/closure_compiler/compiler.jar $raw_filename`;

            my $filename = $destination . '/all.js';
            $self->log->info( sprintf( 'Minifying JS into: %s', $filename ) );
            if ( open( my $fh, '>', $filename ) ) {
                print $fh $_all;
                close $fh;
            }
            else {
                $self->log->error("Could not open file '$filename' $!");
            }
            $self->log->info('Mustache Resources Completed');
        }

        $packer = {};
        return;
    }
}

sub resourceTags {
    my ( $self, $type ) = @_;
    my $resources = $self->config->{resources};

    my $tags = {
        css => '<link rel="stylesheet" type="text/css" href="%s" />',
        js  => '<script src="%s"></script>',
    };

    if ( $ENV{live} ) {

        if ( $type eq 'css' ) {
            return
                sprintf( $$tags{css}, $$resources{destination} . '/all.css' );
        }

        return sprintf( $$tags{js}, $$resources{destination} . '/all.js' );
    }

    my @all;
    if ( $type eq 'css' ) {
        my $css = $$resources{css};
        if (@$css) {
            foreach my $_css (@$css) {
                push( @all, sprintf( $$tags{css}, $_css ) );
            }
            return join( "\n", @all );
        }
    }

    my $mustache           = $$resources{mustache};
    my $js                 = $$resources{js};
    my $mustache_templates = {};
    if (%$mustache) {
        my $path = $self->config->{'View::Web'}->{INCLUDE_PATH}->[0];
        foreach my $template ( keys %$mustache ) {
            $$mustache_templates{$template}
                = $self->__getFileContent( $path . $$mustache{$template} );
        }

        push(
            @all,
            sprintf( "<script type='text/javascript'><!--\n%s\n--></script>",
                      'MUSTACHE_TEMPLATES='
                    . encode_json($mustache_templates)
                    . ';' )
        );
    }

    if (@$js) {
        foreach my $_js (@$js) {
            push( @all, sprintf( $$tags{js}, $_js ) );
        }
    }
    return join( "\n", @all );
}

1;
__END__

=head1 NAME

Pluton - Catalyst based application

=head1 SYNOPSIS


=head1 DESCRIPTION


=head1 SEE ALSO


=head1 AUTHOR

Rolando González Chévere <rolosworld@gmail.com>

=head1 LICENSE

 Copyright (c) 2017 Rolando González Chévere <rolosworld@gmail.com>
 
 This file is part of Pluton.
 
 Pluton is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 3
 as published by the Free Software Foundation.
 
 Pluton is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Pluton.  If not, see <http://www.gnu.org/licenses/>.

=cut
